import { jest } from '@jest/globals'

const MOCK_SHA = '8e80ec28fec6ef9763aacbabb452bcb5d92315ca'

const mockGetPullRequestFiles = jest.fn()

jest.unstable_mockModule('../constants.js', () => ({
  default: {
    GITHUB_WORKSPACE: '',
    OWNER: 'ataylorme',
    REPO: 'eslint-annotate-github-action',
    pullRequest: { number: 1, head: { sha: MOCK_SHA } },
    onlyChangedFiles: true,
    failOnWarning: false,
    unusedDirectiveMessagePrefix: 'Unused eslint-disable directive',
    SHA: MOCK_SHA,
    core: { info: jest.fn(), setFailed: jest.fn() },
    checkName: 'ESLint Report Analysis',
  },
  octokit: {},
}))

jest.unstable_mockModule('../getPullRequestFiles.js', () => ({
  default: mockGetPullRequestFiles,
}))

const { default: getPullRequestChangedAnalyzedReport } = await import('../getPullRequestChangedAnalyzedReport.js')
import type { ESLintReport } from '../types.js'

const mockReport: ESLintReport = [
  {
    filePath: 'src/app.ts',
    messages: [
      {
        ruleId: 'no-console',
        severity: 2,
        message: 'Unexpected console.',
        line: 3,
        column: 1,
        endLine: 3,
        endColumn: 8,
      },
    ],
    suppressedMessages: [],
    errorCount: 1,
    fatalErrorCount: 0,
    warningCount: 0,
    fixableErrorCount: 0,
    fixableWarningCount: 0,
    usedDeprecatedRules: [],
  },
  {
    filePath: 'src/other.ts',
    messages: [{ ruleId: 'no-unused-vars', severity: 2, message: 'Unused var.', line: 1, column: 1 }],
    suppressedMessages: [],
    errorCount: 1,
    fatalErrorCount: 0,
    warningCount: 0,
    fixableErrorCount: 0,
    fixableWarningCount: 0,
    usedDeprecatedRules: [],
  },
]

describe('getPullRequestChangedAnalyzedReport', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('filters report to only PR-changed files', async () => {
    mockGetPullRequestFiles.mockResolvedValue(['src/app.ts'])

    const result = await getPullRequestChangedAnalyzedReport(mockReport)

    expect(result.errorCount).toBe(1)
    expect(result.annotations).toHaveLength(1)
    expect(result.annotations[0].path).toBe('src/app.ts')
    expect(result.summary).toContain('pull request changed files')
  })

  it('returns zero counts when no PR files match the report', async () => {
    mockGetPullRequestFiles.mockResolvedValue(['src/completely-different.ts'])

    const result = await getPullRequestChangedAnalyzedReport(mockReport)

    expect(result.errorCount).toBe(0)
    expect(result.warningCount).toBe(0)
    expect(result.annotations).toHaveLength(0)
    expect(result.success).toBe(true)
  })

  it('leaves unmatched absolute paths unstripped when GITHUB_WORKSPACE is empty', async () => {
    const workspaceReport: ESLintReport = [
      {
        filePath: '/github/workspace/src/app.ts',
        messages: mockReport[0].messages,
        suppressedMessages: [],
        errorCount: 1,
        fatalErrorCount: 0,
        warningCount: 0,
        fixableErrorCount: 0,
        fixableWarningCount: 0,
        usedDeprecatedRules: [],
      },
    ]
    // PR file list uses relative paths; with empty GITHUB_WORKSPACE, absolute path won't match
    mockGetPullRequestFiles.mockResolvedValue(['src/app.ts'])

    const result = await getPullRequestChangedAnalyzedReport(workspaceReport)
    expect(result.errorCount).toBe(0)
  })

  it('truncates markdown when it exceeds 65535 characters', async () => {
    mockGetPullRequestFiles.mockResolvedValue(['src/app.ts'])

    const longReport: ESLintReport = [
      {
        filePath: 'src/app.ts',
        messages: Array.from({ length: 500 }, (_, i) => ({
          ruleId: 'no-console',
          severity: 2,
          message: `Error at line ${i}: ${'x'.repeat(200)}`,
          line: i + 1,
          column: 1,
        })),
        suppressedMessages: [],
        errorCount: 500,
        fatalErrorCount: 0,
        warningCount: 0,
        fixableErrorCount: 0,
        fixableWarningCount: 0,
        usedDeprecatedRules: [],
      },
    ]

    const result = await getPullRequestChangedAnalyzedReport(longReport)
    expect(result.markdown.length).toBeLessThanOrEqual(65535)
    expect(result.markdown).toContain('truncated')
  })
})
