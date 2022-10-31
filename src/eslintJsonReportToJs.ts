import fs from 'fs'
import path from 'path'

import type {ESLintReport} from './types'

/**
 * Converts an ESLint report JSON file to a JavaScript object
 * @param reportFile path to an ESLint JSON file
 */
export default function eslintJsonReportToJs(reportFile: string): ESLintReport {
  const reportPath = path.resolve(reportFile)
  if (!fs.existsSync(reportPath)) {
    throw new Error(`The report-json file "${reportFile}" could not be resolved.`)
  }
  const reportContents = fs.readFileSync(reportPath, 'utf-8')
  const reportParsed: ESLintReport = JSON.parse(reportContents)
  if (!reportParsed) {
    throw new Error(`The report-json file "${reportFile}" is empty.`)
  }
  return reportParsed
}
