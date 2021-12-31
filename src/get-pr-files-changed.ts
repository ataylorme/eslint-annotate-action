import * as core from '@actions/core';
import { Octokit } from '@octokit/action';

import CONSTANTS from './constants';

const { OWNER, PR_NUMBER, REPO } = CONSTANTS;

const PR_FILES_QUERY = `
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
`;
interface PrFilesQueryResponse {
  repository: {
    pullRequest?: {
      endCursor?: string;
      hasNextPage?: boolean;
      files: Array<string>;
    };
  };
}

export default async function getPullRequestFilesChanged(client: Octokit): Promise<string[]> {
  core.debug('Fetching files changed in the pull request.');
  let files: string[] = [];
  const hasNextPage = true;

  for (let cursorPos = 1; hasNextPage; ) {
    try {
      const result: PrFilesQueryResponse = await client.graphql(PR_FILES_QUERY, {
        owner: OWNER,
        repo: REPO,
        prNumber: PR_NUMBER,
        startCursor: cursorPos,
      });
      files = files.concat(result.repository.pullRequest?.files || []);
    } catch (err) {
      // Catch any errors from API calls and fail the action
      const e = typeof err === 'string' ? err : err instanceof Error ? err : 'Error retrieveing pull request files';
      core.error(e);
      core.setFailed('Error occurred getting files changes in the pull request.');
      process.exit(1);
    }
  }

  return files;
}
