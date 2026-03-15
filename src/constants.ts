import * as core from '@actions/core'
import { context, getOctokit } from '@actions/github'
import type { PullRequestPayload } from './types.js'

const token = core.getInput('github-token', { required: true })
export const octokit = getOctokit(token)

const isPullRequest = 'pull_request' in context.payload
const pullRequest: PullRequestPayload | false = isPullRequest
  ? (context.payload.pull_request as PullRequestPayload)
  : false

let sha = context.sha
if (isPullRequest && pullRequest) {
  sha = pullRequest.head.sha
}

function getBooleanInput(name: string, fallback: boolean): boolean {
  const val = core.getInput(name)
  if (!val) return fallback
  return core.getBooleanInput(name)
}

function getInputs() {
  const onlyChangedFiles = getBooleanInput('only-pr-files', true)
  const failOnWarning = getBooleanInput('fail-on-warning', false)
  const failOnError = getBooleanInput('fail-on-error', true)
  const neutralOnWarning = getBooleanInput('neutral-on-warning', false)
  const markdownReportOnStepSummary = getBooleanInput('markdown-report-on-step-summary', false)
  const postComment = getBooleanInput('post-comment', false)
  const checkName = core.getInput('check-name') || 'ESLint Report Analysis'
  const reportFile = core.getInput('report-json', { required: true })

  return {
    onlyChangedFiles,
    failOnWarning,
    failOnError,
    neutralOnWarning,
    markdownReportOnStepSummary,
    postComment,
    checkName,
    reportFile,
  }
}

const {
  onlyChangedFiles,
  failOnWarning,
  failOnError,
  neutralOnWarning,
  markdownReportOnStepSummary,
  postComment,
  checkName,
  reportFile,
} = getInputs()

// Guard: empty string means workspace is unknown; path stripping is skipped
const GITHUB_WORKSPACE = process.env['GITHUB_WORKSPACE'] ?? ''

// https://github.com/eslint/eslint/blob/a59a4e6e9217b3cc503c0a702b9e3b02b20b980d/lib/linter/apply-disable-directives.js#L253
const unusedDirectiveMessagePrefix = 'Unused eslint-disable directive'

const getTimestamp = (): string => new Date().toISOString()

export default {
  core,
  octokit,
  context,
  pullRequest,
  GITHUB_WORKSPACE,
  SHA: sha,
  OWNER: context.repo.owner,
  REPO: context.repo.repo,
  checkName,
  onlyChangedFiles: isPullRequest && onlyChangedFiles,
  reportFile,
  isPullRequest,
  getTimestamp,
  failOnWarning,
  failOnError,
  neutralOnWarning,
  markdownReportOnStepSummary,
  postComment,
  unusedDirectiveMessagePrefix,
}
