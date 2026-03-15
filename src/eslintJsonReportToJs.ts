import * as glob from '@actions/glob'
import fs from 'fs'
import path from 'path'

import type { ESLintReport } from './types.js'

function parseReportFile(reportFile: string): ESLintReport {
  const reportPath = path.resolve(reportFile)
  if (!fs.existsSync(reportPath)) {
    throw new Error(`The report-json file "${reportFile}" could not be resolved.`)
  }

  const reportContents = fs.readFileSync(reportPath, 'utf-8')

  try {
    return JSON.parse(reportContents) as ESLintReport
  } catch {
    throw new Error(`Error parsing the report-json file "${reportFile}".`)
  }
}

/**
 * Converts an ESLint report JSON file (or glob pattern) to an array of JavaScript objects.
 * Throws if the glob matches no files.
 */
export default async function eslintJsonReportToJs(reportFile: string): Promise<ESLintReport> {
  const globber = await glob.create(reportFile)
  const files = await globber.glob()

  if (files.length === 0) {
    throw new Error(
      `No ESLint report files found matching the pattern "${reportFile}". ` +
        `Ensure ESLint ran and produced a JSON report before this action.`,
    )
  }

  return files.map(parseReportFile).flat()
}
