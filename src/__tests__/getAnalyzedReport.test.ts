import { jest } from '@jest/globals'
import reportAnalyzedExpected from './eslintReport-3-errors-analyzed.js'
import indentationReportAnalyzedExpected from './eslintReport-1-error-analyzed.js'
import unusedDisabledDirectiveAnalyzedExpected from './eslintReport-unused-eslint-disable-directive-analyzed.js'
import fatalErrorAnalyzedExpected from './eslintReport-fatal-error-analyzed.js'
import warningAnalyzedExpected from './eslintReport-1-warning-analyzed.js'

const MOCK_SHA = '8e80ec28fec6ef9763aacbabb452bcb5d92315ca'

jest.unstable_mockModule('../constants.js', () => ({
  default: {
    GITHUB_WORKSPACE: '',
    OWNER: 'ataylorme',
    REPO: 'eslint-annotate-github-action',
    SHA: MOCK_SHA,
    failOnWarning: false,
    unusedDirectiveMessagePrefix: 'Unused eslint-disable directive',
    checkName: 'ESLint Report Analysis',
    core: { info: jest.fn(), setFailed: jest.fn() },
  },
}))

const { default: getAnalyzedReport } = await import('../getAnalyzedReport.js')
const { default: eslintJsonReportToJs } = await import('../eslintJsonReportToJs.js')

const cwd = process.cwd()

describe('getAnalyzedReport', () => {
  it('analyzes a standard ESLint JSON report', async () => {
    const reportJS = await eslintJsonReportToJs(`${cwd}/src/__tests__/eslintReport-3-errors.json`)
    expect(getAnalyzedReport(reportJS)).toEqual(reportAnalyzedExpected)
  })

  it('analyzes a report with indentation errors', async () => {
    const reportJS = await eslintJsonReportToJs(`${cwd}/src/__tests__/eslintReport-1-error.json`)
    expect(getAnalyzedReport(reportJS)).toEqual(indentationReportAnalyzedExpected)
  })

  it('handles --report-unused-disable-directives (null ruleId, non-fatal)', async () => {
    const reportJS = await eslintJsonReportToJs(
      `${cwd}/src/__tests__/eslintReport-unused-eslint-disable-directive.json`,
    )
    expect(getAnalyzedReport(reportJS)).toEqual(unusedDisabledDirectiveAnalyzedExpected)
  })

  it('handles fatal parse errors (null ruleId, fatal: true)', async () => {
    const reportJS = await eslintJsonReportToJs(`${cwd}/src/__tests__/eslintReport-fatal-error.json`)
    expect(getAnalyzedReport(reportJS)).toEqual(fatalErrorAnalyzedExpected)
  })

  it('correctly annotates warnings with annotation_level "warning"', async () => {
    const reportJS = await eslintJsonReportToJs(`${cwd}/src/__tests__/eslintReport-1-warning.json`)
    const result = getAnalyzedReport(reportJS)
    expect(result).toEqual(warningAnalyzedExpected)
    expect(result.annotations[0].annotation_level).toBe('warning')
  })

  it('sets success=true when there are only warnings and failOnWarning=false', async () => {
    const reportJS = await eslintJsonReportToJs(`${cwd}/src/__tests__/eslintReport-1-warning.json`)
    const result = getAnalyzedReport(reportJS, false)
    expect(result.success).toBe(true)
    expect(result.warningCount).toBe(1)
    expect(result.errorCount).toBe(0)
  })

  it('sets success=false when there are warnings and failOnWarning=true', async () => {
    const reportJS = await eslintJsonReportToJs(`${cwd}/src/__tests__/eslintReport-1-warning.json`)
    const result = getAnalyzedReport(reportJS, true)
    expect(result.success).toBe(false)
    expect(result.warningCount).toBe(1)
  })

  it('returns empty annotations and success=true for a clean report', async () => {
    const result = getAnalyzedReport([])
    expect(result.success).toBe(true)
    expect(result.errorCount).toBe(0)
    expect(result.warningCount).toBe(0)
    expect(result.annotations).toHaveLength(0)
  })

  it('passes absolute paths through unchanged when GITHUB_WORKSPACE is not set', () => {
    // In the test environment GITHUB_WORKSPACE is '', so the stripping logic is a no-op
    // and absolute paths appear in annotations as-is.
    const reportJS = [
      {
        filePath: '/home/runner/work/repo/src/app.ts',
        messages: [
          { ruleId: 'no-console', severity: 1, message: 'No console.', line: 1, column: 1, endLine: 1, endColumn: 10 },
        ],
        suppressedMessages: [],
        errorCount: 0,
        fatalErrorCount: 0,
        warningCount: 1,
        fixableErrorCount: 0,
        fixableWarningCount: 0,
        usedDeprecatedRules: [],
      },
    ]

    const result = getAnalyzedReport(reportJS)
    expect(result.annotations[0].path).toBe('/home/runner/work/repo/src/app.ts')
  })
})
