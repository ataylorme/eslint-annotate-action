import eslintJsonReportToJs from '../eslintJsonReportToJs'
import reportJSExpected from './eslintReport-3-errors'
import indentReportJSExpected from './eslintReport-1-error'
const cwd = process.cwd()

describe('ESLint report JSON to JS', () => {
  it('Converts a standard ESLint JSON file to a JS object', async () => {
    const testReportPath = `${cwd}/src/__tests__/eslintReport-3-errors.json`
    const reportJS = eslintJsonReportToJs(testReportPath)
    expect(reportJS).toEqual(reportJSExpected)
  })

  it('Converts an ESLint JSON file with indentation errors to a JS object', async () => {
    const testReportPath = `${cwd}/src/__tests__/eslintReport-1-error.json`
    const reportJS = eslintJsonReportToJs(testReportPath)
    expect(reportJS).toEqual(indentReportJSExpected)
  })
})
