/* eslint-disable @typescript-eslint/camelcase */
import fs from 'fs';
import path from 'path';

import * as core from '@actions/core';
import * as github from '@actions/github';
import { ChecksUpdateParams, ChecksUpdateParamsOutputAnnotations } from '@octokit/rest';

const { GITHUB_WORKSPACE } = process.env;
const OWNER = github.context.repo.owner;
const REPO = github.context.repo.repo;
const CHECK_NAME = 'ESLint Report Analysis';

const getPrNumber = (): number | undefined => {
  const pullRequest = github.context.payload.pull_request;

  if (!pullRequest) {
    return;
  }

  return pullRequest.number;
};

const getSha = (): string => {
  const pullRequest = github.context.payload.pull_request;

  if (!pullRequest) {
    return github.context.sha;
  }

  return pullRequest.head.sha;
};

async function fetchFilesBatch(client: github.GitHub, prNumber: number, startCursor?: string): Promise<PrResponse> {
  const { repository } = await client.graphql(
    `
    query ChangedFilesbatch($owner: String!, $repo: String!, $prNumber: Int!, $startCursor: String) {
      repository(owner: $owner, name: $repo) {
        pullRequest(number: $prNumber) {
          files(first: 100, after: $startCursor) {
            pageInfo {
              hasNextPage
              endCursor
            }
            totalCount
            edges {
              cursor
              node {
                path
              }
            }
          }
        }
      }
    }
  `,
    { owner: OWNER, repo: REPO, prNumber, startCursor }
  );

  const pr = repository.pullRequest;

  if (!pr || !pr.files) {
    return { files: [] };
  }

  return {
    ...pr.files.pageInfo,
    files: pr.files.edges.map(e => e.node.path),
  };
}

async function getChangedFiles(client: github.GitHub, prNumber: number): Promise<string[]> {
  let files: string[] = [];
  let hasNextPage = true;
  let startCursor: string | undefined = undefined;

  while (hasNextPage) {
    try {
      const result = await fetchFilesBatch(client, prNumber, startCursor);

      files = files.concat(result.files);
      hasNextPage = result.hasNextPage;
      startCursor = result.endCursor;
    } catch (err) {
      core.error(err);
      core.setFailed('Error occurred getting changed files.');
      return files;
    }
  }

  return files;
}

function getNumErrors(lintedFiles: Array<ESLintEntry>): number {
  let errorCount = 0;

  for (const result of lintedFiles) {
    errorCount += result.errorCount;
  }

  return errorCount;
}

function analyzeReport(lintedFiles: Array<ESLintEntry>, errorsOnly: boolean): ReportAnalysis {
  let errorCount = 0;
  let warningCount = 0;
  let errorText = '';
  let warningText = '';
  let markdownText = '';

  for (const result of lintedFiles) {
    errorCount += result.errorCount;
    warningCount += result.warningCount;
    const { filePath, messages } = result;
    for (const lintMessage of messages) {
      const { line, endLine, severity, ruleId, message } = lintMessage;

      const isWarning = severity < 2;

      const typeText = isWarning ? 'Warning' : 'Error';

      const filePathTrimmed = filePath.replace(`${GITHUB_WORKSPACE}/`, '');

      const sha = getSha();

      const link = `https://github.com/${OWNER}/${REPO}/blob/${sha}/${filePathTrimmed}#L${line}:L${endLine}`;

      const messageFormatted = message.replace(/`/g, '\\`');

      let messageText = '### ${typeText} in `' + filePathTrimmed + '`\n';
      messageText += '- [Link](' + link + ')\n';
      messageText += '- Start Line: `' + line + '`\n';
      messageText += '- End Line: `' + endLine + '`\n';
      messageText += '- Severity: `' + severity + '` (' + typeText + ')\n';
      messageText += '- Message: `[' + ruleId + '] ' + messageFormatted + '`\n';

      if (isWarning) {
        warningText += messageText;
      } else {
        errorText += messageText;
      }
    }
  }

  if (errorText.length) {
    markdownText += '## ' + errorCount + ' Error(s):\n';
    markdownText += errorText + '\n';
  }

  if (!errorsOnly && warningText.length) {
    markdownText += '## ' + warningCount + ' Warning(s):\n';
    markdownText += warningText + '\n';
  }

  return {
    errorCount: errorCount,
    warningCount: warningCount,
    markdown: markdownText,
  };
}

function processReport(lintedFiles: Array<ESLintEntry>, errorsOnly: boolean): Partial<ChecksUpdateParams> {
  const annotations: ChecksUpdateParamsOutputAnnotations[] = [];
  let errorCount = 0;
  let warningCount = 0;

  for (const result of lintedFiles) {
    // Max 50 annotations per API request
    if (annotations.length >= 50) {
      break;
    }
    const { filePath, messages } = result;

    errorCount += result.errorCount;
    warningCount += result.warningCount;

    console.info(`Analyzing ${filePath}`);
    for (const lintMessage of messages) {
      const { line, endLine, column, endColumn, severity, ruleId, message } = lintMessage;

      const isWarning = severity < 2;

      if (errorsOnly && isWarning) {
        continue;
      }

      const annotation: ChecksUpdateParamsOutputAnnotations = {
        path: filePath.replace(`${GITHUB_WORKSPACE}/`, ''),
        start_line: line,
        end_line: endLine,
        annotation_level: isWarning ? 'warning' : 'failure',
        message: `[${ruleId}] ${message}`,
      };

      // Start and end column can only be added if start_line and end_line are equal
      if (line === endLine) {
        annotation.start_column = column;
        annotation.end_column = endColumn;
      }

      // See https://developer.github.com/v3/checks/runs/#annotations-object
      annotations.push(annotation);
    }
  }

  return {
    conclusion: errorCount > 0 ? 'failure' : 'success',
    output: {
      title: CHECK_NAME,
      summary: `${errorCount} ESLint error(s) and ${warningCount} ESLint warning(s) found`,
      annotations,
    },
  };
}

async function run(): Promise<void> {
  const report = core.getInput('report-json', { required: true });
  const reportPath = path.resolve(report);
  if (!fs.existsSync(reportPath)) {
    core.setFailed('The report-json file "${report}" could not be resolved.');
  }
  const reportContents = fs.readFileSync(reportPath, 'utf-8');
  const reportJSON = JSON.parse(reportContents);
  const token = core.getInput('repo-token', { required: true });
  const errorsOnly = Boolean(core.getInput('errors-only'));
  const prNumber = getPrNumber();

  if (!prNumber) {
    try {
      const reportAnalysis = analyzeReport(reportJSON, errorsOnly);
      const oktokit = new github.GitHub(token);
      await oktokit.checks.create({
        owner: OWNER,
        repo: REPO,
        started_at: new Date().toISOString(),
        head_sha: getSha(),
        completed_at: new Date().toISOString(),
        status: 'completed',
        name: CHECK_NAME,
        conclusion: reportAnalysis.errorCount > 0 ? 'failure' : 'success',
        output: {
          title: CHECK_NAME,
          summary: `${reportAnalysis.errorCount} error(s) and ${reportAnalysis.warningCount} warning(s) were found`,
          text: reportAnalysis.markdown,
        },
      });
    } catch (err) {
      core.setFailed(err.message ? err.message : 'Error analyzing the provided ESLint report.');
    }
    return;
  }

  try {
    const oktokit = new github.GitHub(token);
    core.debug('Fetching files changed in the pull request.');
    const files = await getChangedFiles(oktokit, prNumber);

    if (files.length > 0) {
      const {
        data: { id: checkId },
      } = await oktokit.checks.create({
        owner: OWNER,
        repo: REPO,
        started_at: new Date().toISOString(),
        head_sha: getSha(),
        status: 'in_progress',
        name: CHECK_NAME,
      });

      const payload = processReport(reportJSON, errorsOnly);

      // See https://octokit.github.io/rest.js/#octokit-routes-checks
      await oktokit.checks.update({
        owner: OWNER,
        repo: REPO,
        completed_at: new Date().toISOString(),
        status: 'completed',
        check_run_id: checkId,
        ...payload,
      });
    } else {
      core.info('No files changed in the PR.');
    }
  } catch (err) {
    core.setFailed(err.message ? err.message : 'Error comparing changed files to the provided ESLint report.');
  }
}

run();
