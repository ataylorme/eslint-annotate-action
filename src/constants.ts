import * as github from '@actions/github';
import { PullRequestEvent, PullRequest } from '@octokit/webhooks-types';

const pullRequestEvent: PullRequestEvent = github.context.payload as PullRequestEvent;
const pullRequest: PullRequest = pullRequestEvent.pull_request;

const getPrNumber = (): number => {
  if (!pullRequest) {
    return -1;
  }

  return pullRequest.number;
};

const getSha = (): string => {
  if (!pullRequest) {
    return github.context.sha;
  }

  return pullRequest.head.sha;
};

export default {
  OWNER: github.context.repo.owner,
  REPO: github.context.repo.repo,
  PULL_REQUEST: pullRequest,
  PR_NUMBER: getPrNumber(),
  CHECK_NAME: 'ESLint Report Analysis',
  GITHUB_WORKSPACE: process.env.GITHUB_WORKSPACE ?? process.cwd(),
  SHA: getSha(),
};
