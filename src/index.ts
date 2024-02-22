import * as core from '@actions/core'
import eslintJsonReportToJs from './eslintJsonReportToJs'
import getAnalyzedReport from './getAnalyzedReport'
import openStatusCheck from './openStatusCheck'
import closeStatusCheck from './closeStatusCheck'
import addAnnotationsToStatusCheck from './addAnnotationsToStatusCheck'
import getPullRequestChangedAnalyzedReport from './getPullRequestChangedAnalyzedReport'
import addSummary from './addSummary'
import constants from './constants'
const {reportFile, onlyChangedFiles, failOnError, failOnWarning, markdownReportOnStepSummary} = constants

async function run(): Promise<void> {
  core.info(`Starting analysis of the ESLint report ${reportFile.replace(/\n/g, ', ')}. Standby...`)
  const reportJS = await eslintJsonReportToJs(reportFile)
  const analyzedReport = onlyChangedFiles
    ? await getPullRequestChangedAnalyzedReport(reportJS)
    : getAnalyzedReport(reportJS)
  const annotations = analyzedReport.annotations
  const conclusion = analyzedReport.success ? 'success' : 'failure'

  core.info(analyzedReport.summary)

  core.setOutput('summary', analyzedReport.summary)
  core.setOutput('errorCount', analyzedReport.errorCount)
  core.setOutput('warningCount', analyzedReport.warningCount)

  try {
    // Create a new, in-progress status check
    const checkId = await openStatusCheck()

    // Add all the annotations to the status check
    await addAnnotationsToStatusCheck(annotations, checkId)

    // Add report to job summary
    if (markdownReportOnStepSummary) {
      await addSummary(analyzedReport.markdown)
    }

    // Finally, close the GitHub check as completed
    await closeStatusCheck(
      conclusion,
      checkId,
      analyzedReport.summary,
      markdownReportOnStepSummary ? analyzedReport.markdown : '',
    )

    // Fail the Action if the report analysis conclusions is failure
    if ((failOnWarning || failOnError) && conclusion === 'failure') {
      core.setFailed(`${analyzedReport.errorCount} errors and ${analyzedReport.warningCount} warnings`)
      process.exit(1)
    }
  } catch (err) {
    const errorMessage = 'Error creating a status check for the ESLint analysis.'
    // err only has an error message if it is an instance of Error
    if (err instanceof Error) {
      core.setFailed(err.message ? err.message : errorMessage)
    } else {
      core.setFailed(errorMessage)
    }
  }
  // If we got this far things were a success
  core.info('ESLint report analysis complete. No errors found!')
  process.exit(0)
}

run()
