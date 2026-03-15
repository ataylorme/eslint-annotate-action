import type { RestEndpointMethodTypes } from '@octokit/plugin-rest-endpoint-methods'

// GitHub Checks API annotation object
export interface CheckAnnotation {
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

// Octokit parameter/response types derived from installed dep versions
export type CheckCreateParams = RestEndpointMethodTypes['checks']['create']['parameters']
export type CheckUpdateParams = RestEndpointMethodTypes['checks']['update']['parameters']
export type CheckCreateData = RestEndpointMethodTypes['checks']['create']['response']['data']
export type CheckUpdateData = RestEndpointMethodTypes['checks']['update']['response']['data']

// Minimal pull_request payload fields this action needs
export interface PullRequestPayload {
  number: number
  head: { sha: string }
}

// ESLint JSON report types (see https://eslint.org/docs/latest/use/formatters/)
export interface ESLintMessage {
  ruleId: string | null
  severity: number
  message: string
  line: number
  column: number
  nodeType?: string | null
  endLine?: number
  endColumn?: number
  fatal?: boolean
  fix?: {
    range: [number, number]
    text: string
  }
  messageId?: string
}

export interface ESLintEntry {
  filePath: string
  messages: ESLintMessage[]
  suppressedMessages: ESLintMessage[]
  errorCount: number
  fatalErrorCount: number
  warningCount: number
  fixableErrorCount: number
  fixableWarningCount: number
  source?: string | null
  usedDeprecatedRules: Array<{ ruleId: string; replacedBy: string[] }>
}

export type ESLintReport = ESLintEntry[]

export interface AnalyzedESLintReport {
  errorCount: number
  warningCount: number
  success: boolean
  markdown: string
  summary: string
  annotations: CheckAnnotation[]
}
