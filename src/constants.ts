import * as core from '@actions/core'
import {config as dotEnvConfig} from 'dotenv'
dotEnvConfig()
import {context} from '@actions/github'
import {Octokit} from '@octokit/action'
import type {pullRequestWebhook} from './types'
import type {OctokitOptions} from '@octokit/core'

export const cwd = process.cwd()

const areTesting = process.env.NODE_ENV === 'test'

const isGitHubActions = process.env.GITHUB_ACTIONS

const octokitParams: OctokitOptions = areTesting ? {authStrategy: undefined} : {}
const octokit = new Octokit(octokitParams)

// If this is a pull request, store the context
// Otherwise, set to false
const isPullRequest = Object.prototype.hasOwnProperty.call(context.payload, 'pull_request')
const pullRequest: pullRequestWebhook | false = isPullRequest ? context.payload.pull_request : false

let sha = context.sha

if (isPullRequest) {
  sha = pullRequest.head.sha
}

if (areTesting) {
  sha = '8e80ec28fec6ef9763aacbabb452bcb5d92315ca'
}

function getBooleanInput(inputName: string, defaultValue: string): boolean {
  const inputValue = core.getInput(inputName) || defaultValue
  return inputValue === 'true'
}

function getInputs() {
  const onlyChangedFiles = getBooleanInput('only-pr-files', 'true')
  const failOnWarning = getBooleanInput('fail-on-warning', 'false')
  const failOnError = getBooleanInput('fail-on-error', 'true')
  const markdownReportOnStepSummary = getBooleanInput('markdown-report-on-step-summary', 'false')
  const checkName = core.getInput('check-name') || 'ESLint Report Analysis'
  const reportFile = areTesting
    ? 'src/__tests__/eslintReport-3-errors.json'
    : core.getInput('report-json', {required: true})

  return {
    onlyChangedFiles,
    failOnWarning,
    failOnError,
    markdownReportOnStepSummary,
    checkName,
    reportFile,
  }
}

const {onlyChangedFiles, failOnWarning, failOnError, markdownReportOnStepSummary, checkName, reportFile} = getInputs()

// https://github.com/eslint/eslint/blob/a59a4e6e9217b3cc503c0a702b9e3b02b20b980d/lib/linter/apply-disable-directives.js#L253
const unusedDirectiveMessagePrefix = 'Unused eslint-disable directive'

const getTimestamp = (): string => {
  return new Date().toISOString()
}

export default {
  core,
  octokit,
  cwd,
  context,
  pullRequest,
  GITHUB_WORKSPACE: process.env.GITHUB_WORKSPACE as string,
  SHA: sha,
  CONTEXT: context,
  OWNER: areTesting ? 'ataylorme' : context.repo.owner,
  REPO: areTesting ? 'eslint-annotate-github-action' : context.repo.repo,
  checkName,
  onlyChangedFiles: isPullRequest && onlyChangedFiles,
  reportFile,
  isPullRequest,
  isGitHubActions,
  getTimestamp,
  failOnWarning,
  failOnError,
  markdownReportOnStepSummary,
  unusedDirectiveMessagePrefix,
}
