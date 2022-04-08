import * as github from '@actions/github';
import { GitHub, getOctokitOptions } from '@actions/github/lib/utils';
import * as core from '@actions/core';

const token = core.getInput('repo-token', { required: true });
const octokit = new GitHub(getOctokitOptions(token));
const pullRequest = github.context.payload.pull_request;

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
  GITHUB_WORKSPACE: process.env.GITHUB_WORKSPACE,
  TOKEN: token,
  OCTOKIT: octokit,
  SHA: getSha(),
};
