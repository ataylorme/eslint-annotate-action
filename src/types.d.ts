import {ESLint as ESLintType} from '@types/eslint'
export type eslintResultType = ESLintType.LintResult

// https://www.npmjs.com/package/@octokit/types
import {Endpoints, GetResponseDataTypeFromEndpointMethod} from '@octokit/types'
import {Webhooks} from '@octokit/webhooks-definitions'

// GitHub Octokit Types
export type prFilesParametersType = Endpoints['GET /repos/:owner/:repo/pulls/:pull_number/files']['parameters']
export type prFilesResponseType = Endpoints['GET /repos/:owner/:repo/pulls/:pull_number/files']['response']
export type checkUpdateParametersType = Endpoints['PATCH /repos/:owner/:repo/check-runs/:check_run_id']['parameters']
export type checkCreateParametersType = Endpoints['POST /repos/:owner/:repo/check-runs']['parameters']
export type pullRequestWebhook = Webhooks['pull_request']
export type createCheckRunResponseDataType = GetResponseDataTypeFromEndpointMethod<typeof octokit.checks.create>
export type updateCheckRunResponseDataType = GetResponseDataTypeFromEndpointMethod<typeof octokit.checks.update>

// Custom Types

// https://developer.github.com/v3/checks/runs/#list-check-run-annotations
export interface ChecksUpdateParamsOutputAnnotations {
  path: string
  start_line: number
  end_line: number
  start_column?: number
  end_column?: number
  annotation_level: 'notice' | 'warning' | 'failure'
  message: string
  title?: string
  raw_details?: string
}

export interface ESLintMessage {
  ruleId: string
  severity: number
  message: string
  line: number
  column: number
  nodeType: string | null
  endLine?: number
  endColumn?: number | null
  fix?: {
    range: number[]
    text: string
  }
  messageId?: string
}

export interface ESLintEntry {
  filePath: string
  messages: ESLintMessage[]
  errorCount: number
  warningCount: number
  fixableErrorCount: number
  fixableWarningCount: number
  source?: string
  usedDeprecatedRules?: []
}

export type ESLintReport = ESLintEntry[]

export interface AnalyzedESLintReport {
  errorCount: number
  warningCount: number
  success: boolean
  markdown: string
  summary: string
  annotations: ChecksUpdateParamsOutputAnnotations[]
}

export interface RollupReport {
  errorCount: number
  warningCount: number
  success: boolean
  markdown: string
  summary: string
  annotations: ChecksUpdateParamsOutputAnnotations[]
  reports: AnalyzedESLintReport[]
}

export interface FileSet {
  name: string
  files: ESLintEntry[]
}
