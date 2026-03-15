import eslintJsonReportToJs from '../eslintJsonReportToJs.js'
import reportJSExpected from './eslintReport-3-errors.js'
import indentReportJSExpected from './eslintReport-1-error.js'

const cwd = process.cwd()

describe('eslintJsonReportToJs', () => {
  it('converts a standard ESLint JSON file to a JS object', async () => {
    const testReportPath = `${cwd}/src/__tests__/eslintReport-3-errors.json`
    const reportJS = await eslintJsonReportToJs(testReportPath)
    expect(reportJS).toEqual(reportJSExpected)
  })

  it('converts an ESLint JSON file with indentation errors to a JS object', async () => {
    const testReportPath = `${cwd}/src/__tests__/eslintReport-1-error.json`
    const reportJS = await eslintJsonReportToJs(testReportPath)
    expect(reportJS).toEqual(indentReportJSExpected)
  })

  it('supports glob patterns and merges multiple reports', async () => {
    // Pattern targets only the 1-error and 3-errors fixtures (excludes fatal-error, warning, etc.)
    const testReportPath = `${cwd}/src/__tests__/eslintReport-[13]-error*.json`
    const reportJS = await eslintJsonReportToJs(testReportPath)
    expect(reportJS).toEqual([...indentReportJSExpected, ...reportJSExpected])
  })

  it('throws when the glob matches no files', async () => {
    const testReportPath = `${cwd}/src/__tests__/eslintReport-does-not-exist.json`
    await expect(eslintJsonReportToJs(testReportPath)).rejects.toThrow('No ESLint report files found')
  })

  it('throws when a matched file contains invalid JSON', async () => {
    // eslintReport-empty.json is a zero-byte file — JSON.parse('') throws
    const testReportPath = `${cwd}/src/__tests__/eslintReport-empty.json`
    await expect(eslintJsonReportToJs(testReportPath)).rejects.toThrow('Error parsing the report-json file')
  })
})
