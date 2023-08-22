import * as glob from '@actions/glob'
import fs from 'fs'
import path from 'path'

import type {ESLintReport} from './types'

function parseReportFile(reportFile: string) {
  const reportPath = path.resolve(reportFile)
  if (!fs.existsSync(reportPath)) {
    throw new Error(`The report-json file "${reportFile}" could not be resolved.`)
  }

  const reportContents = fs.readFileSync(reportPath, 'utf-8')
  let reportParsed: ESLintReport

  try {
    reportParsed = JSON.parse(reportContents)
  } catch (error) {
    throw new Error(`Error parsing the report-json file "${reportFile}".`)
  }

  return reportParsed
}

/**
 * Converts an ESLint report JSON file to an array of JavaScript objects
 * @param reportFile path to an ESLint JSON file
 */
export default async function eslintJsonReportToJs(reportFile: string): Promise<ESLintReport> {
  const globber = await glob.create(reportFile)
  const files = await globber.glob()

  return files.map(parseReportFile).flat()
}
