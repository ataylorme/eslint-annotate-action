import * as core from '@actions/core';

import { PrResponse } from './types';
import CONSTANTS from './constants';

const { OWNER, PR_NUMBER, REPO, OCTOKIT } = CONSTANTS;

async function fetchFilesBatch(prNumber: number, startCursor?: string): Promise<PrResponse> {
  const { repository } = await OCTOKIT.graphql(
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

export default async function getPullRequestFilesChanged(): Promise<string[]> {
  core.debug('Fetching files changed in the pull request.');
  let files: string[] = [];
  let hasNextPage = true;
  let startCursor: string | undefined = undefined;

  while (hasNextPage) {
    try {
      const result = await fetchFilesBatch(PR_NUMBER, startCursor);

      files = files.concat(result.files);
      hasNextPage = result.hasNextPage;
      startCursor = result.endCursor;
    } catch (err) {
      // Catch any errors from API calls and fail the action
      core.error(err);
      core.setFailed('Error occurred getting files changes in the pull request.');
      process.exit(1);
    }
  }

  return files;
}
