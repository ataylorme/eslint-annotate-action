import {Toolkit} from 'actions-toolkit'
import * as core from '@actions/core'
import eslintJsonReportToJs from './eslintJsonReportToJs'
import getAnalyzedReport from './getAnalyzedReport'
import openStatusCheck from './openStatusCheck'
import closeStatusCheck from './closeStatusCheck'
import addAnnotationsToStatusCheck from './addAnnotationsToStatusCheck'
import getPullRequestChangedAnalyzedReport from './getPullRequestChangedAnalyzedReport'
import addSummary from './addSummary'
import constants from './constants'
const {reportFile, onlyChangedFiles, failOnError, failOnWarning, markdownReportOnStepSummary, outputToLocation} = constants

Toolkit.run(async (tools) => {
  tools.log.info(`Starting analysis of the ESLint report ${reportFile}. Standby...`)
  const reportJS = eslintJsonReportToJs(reportFile)
  const analyzedReport = onlyChangedFiles
    ? await getPullRequestChangedAnalyzedReport(reportJS)
    : getAnalyzedReport(reportJS)
  const annotations = analyzedReport.annotations
  const conclusion = analyzedReport.success ? 'success' : 'failure'

  tools.log.info(analyzedReport.summary)

  core.setOutput('summary', analyzedReport.summary)
  core.setOutput('errorCount', analyzedReport.errorCount)
  core.setOutput('warningCount', analyzedReport.warningCount)

  try {
    // Create a new, in-progress status check
    const checkId = await openStatusCheck()

    // Add all the annotations to the status check
    await addAnnotationsToStatusCheck(annotations, checkId)

    // Add report to job summary
    if (outputToLocation === 'step-summary') {
      await addSummary(analyzedReport.markdown ?? analyzedReport.summary)
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
      tools.exit.failure(`${analyzedReport.errorCount} errors and ${analyzedReport.warningCount} warnings`)
      process.exit(1)
    }
  } catch (err) {
    const errorMessage = 'Error creating a status check for the ESLint analysis.'
    // err only has an error message if it is an instance of Error
    if (err instanceof Error) {
      tools.exit.failure(err.message ? err.message : errorMessage)
    } else {
      tools.exit.failure(errorMessage)
    }
  }
  // If we got this far things were a success
  tools.exit.success('ESLint report analysis complete. No errors found!')
})