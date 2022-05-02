import getAnalyzedReport from '../getAnalyzedReport'
import eslintJsonReportToJs from '../eslintJsonReportToJs'
import reportAnalyzedExpected from './eslintReport-3-errors-analyzed'
import indentationReportAnalyzedExpected from './eslintReport-1-error-analyzed'

const cwd = process.cwd()

describe('ESLint report JSON to Analyzed report', () => {
  it('Converts a standard ESLint JSON file to an analyzeed report', async () => {
    const testReportPath = `${cwd}/src/__tests__/eslintReport-3-errors.json`
    const reportJS = eslintJsonReportToJs(testReportPath)
    const analyzedReport = getAnalyzedReport(reportJS)
    expect(analyzedReport).toEqual(reportAnalyzedExpected)
  })

  it('Converts an ESLint JSON file with indentation errors to an analyzeed report', async () => {
    const testReportPath = `${cwd}/src/__tests__/eslintReport-1-error.json`
    const reportJS = eslintJsonReportToJs(testReportPath)
    const analyzedReport = getAnalyzedReport(reportJS)
    expect(analyzedReport).toEqual(indentationReportAnalyzedExpected)
  })
})
