import getPullRequestFiles from './getPullRequestFiles.js'
import getAnalyzedReport from './getAnalyzedReport.js'
import type { ESLintReport, AnalyzedESLintReport } from './types.js'
import constants from './constants.js'
const { GITHUB_WORKSPACE, OWNER, REPO, pullRequest, onlyChangedFiles } = constants

function stripWorkspace(filePath: string): string {
  if (GITHUB_WORKSPACE && filePath.startsWith(GITHUB_WORKSPACE)) {
    return filePath.slice(GITHUB_WORKSPACE.length + 1)
  }
  return filePath
}

/**
 * Analyzes an ESLint report, filtering to pull request changed files.
 */
export default async function getPullRequestChangedAnalyzedReport(
  reportJS: ESLintReport,
): Promise<AnalyzedESLintReport> {
  if (!pullRequest) {
    throw new Error('getPullRequestChangedAnalyzedReport called outside of a pull_request event')
  }

  const changedFiles = await getPullRequestFiles(OWNER, REPO, pullRequest.number)

  // Strip workspace prefix without mutating the original report entries
  const normalizedReport = reportJS.map((file) => ({ ...file, filePath: stripWorkspace(file.filePath) }))

  const pullRequestFilesReport: ESLintReport = normalizedReport.filter((file) => changedFiles.includes(file.filePath))

  const analyzedPRReport = getAnalyzedReport(pullRequestFilesReport)
  let summary = `${analyzedPRReport.summary} in pull request changed files.`
  let markdown = `# Pull Request Changed Files ESLint Results:\n**${analyzedPRReport.summary}**\n${analyzedPRReport.markdown}`

  if (!onlyChangedFiles) {
    const nonPRFilesReport: ESLintReport = normalizedReport.filter((file) => !changedFiles.includes(file.filePath))
    const analyzedNonPRReport = getAnalyzedReport(nonPRFilesReport)

    summary += ` ${analyzedNonPRReport.summary} in files outside of the pull request.`
    markdown += `\n\n# Non-Pull Request Changed Files ESLint Results:\n**${analyzedNonPRReport.summary}**\n${analyzedNonPRReport.markdown}`
  }

  if (markdown.length > 65535) {
    markdown = markdown.slice(0, 65250) + '\n\n...summary too long, truncated.'
  }

  return {
    errorCount: analyzedPRReport.errorCount,
    warningCount: analyzedPRReport.warningCount,
    markdown,
    success: analyzedPRReport.success,
    summary,
    annotations: analyzedPRReport.annotations,
  }
}
