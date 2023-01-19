import * as core from '@actions/core'
import {config as dotEnvConfig} from 'dotenv'
dotEnvConfig()
import {Octokit} from '@octokit/rest'
import {Toolkit} from 'actions-toolkit'
import type {pullRequestWebhook} from './types'

export const cwd = process.cwd()

const areTesting = process.env.NODE_ENV === 'test'

const isGitHubActions = process.env.GITHUB_ACTIONS

const githubToken =
  isGitHubActions && !areTesting ? core.getInput('repo-token', {required: true}) : process.env.GITHUB_TOKEN

const octokit = new Octokit({
  previews: ['antiope'],
  auth: githubToken,
})

const tools = new Toolkit({
  token: githubToken,
})

// If this is a pull request, store the context
// Otherwise, set to false
const isPullRequest = Object.prototype.hasOwnProperty.call(tools.context.payload, 'pull_request')
const pullRequest: pullRequestWebhook | false = isPullRequest ? tools.context.payload.pull_request : false

let sha = tools.context.sha

if (isPullRequest) {
  sha = pullRequest.head.sha
}

if (areTesting) {
  sha = '8e80ec28fec6ef9763aacbabb452bcb5d92315ca'
}

const onlyChangedFiles = core.getInput('only-pr-files') || 'true'
const failOnWarningInput = core.getInput('fail-on-warning') || 'false'
const failOnErrorInput = core.getInput('fail-on-error') || 'true'
const checkName = core.getInput('check-name') || 'ESLint Report Analysis'
const failOnWarning = failOnWarningInput === 'true'
const failOnError = failOnErrorInput === 'true'

const reportFile = areTesting
  ? 'src/__tests__/eslintReport-3-errors.json'
  : core.getInput('report-json', {required: true})

const getTimestamp = (): string => {
  return new Date().toISOString()
}

export default {
  token: githubToken,
  octokit,
  cwd,
  toolkit: tools,
  pullRequest,
  GITHUB_WORKSPACE: process.env.GITHUB_WORKSPACE as string,
  SHA: sha,
  CONTEXT: tools.context,
  OWNER: areTesting ? 'ataylorme' : tools.context.repo.owner,
  REPO: areTesting ? 'eslint-annotate-github-action' : tools.context.repo.repo,
  checkName,
  onlyChangedFiles: isPullRequest && onlyChangedFiles === 'true',
  reportFile,
  isPullRequest,
  isGitHubActions,
  getTimestamp,
  failOnWarning,
  failOnError,
}
