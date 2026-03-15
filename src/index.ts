import * as core from '@actions/core'
import eslintJsonReportToJs from './eslintJsonReportToJs.js'
import getAnalyzedReport from './getAnalyzedReport.js'
import openStatusCheck from './openStatusCheck.js'
import closeStatusCheck from './closeStatusCheck.js'
import addAnnotationsToStatusCheck from './addAnnotationsToStatusCheck.js'
import getPullRequestChangedAnalyzedReport from './getPullRequestChangedAnalyzedReport.js'
import addSummary from './addSummary.js'
import addComment from './addComment.js'
import constants from './constants.js'
const {reportFile, onlyChangedFiles, failOnError, failOnWarning, neutralOnWarning, markdownReportOnStepSummary, postComment} = constants

async function run(): Promise<void> {
  core.info(`Starting analysis of the ESLint report ${reportFile.replace(/\n/g, ', ')}. Standby...`)

  try {
    const reportJS = await eslintJsonReportToJs(reportFile)
    const analyzedReport = onlyChangedFiles
      ? await getPullRequestChangedAnalyzedReport(reportJS)
      : getAnalyzedReport(reportJS)

    core.info(analyzedReport.summary)
    core.setOutput('summary', analyzedReport.summary)
    core.setOutput('errorCount', analyzedReport.errorCount)
    core.setOutput('warningCount', analyzedReport.warningCount)

    // Determine check conclusion
    let conclusion: 'success' | 'failure' | 'neutral'
    if (!analyzedReport.success) {
      conclusion = 'failure'
    } else if (neutralOnWarning && analyzedReport.warningCount > 0 && !failOnWarning) {
      conclusion = 'neutral'
    } else {
      conclusion = 'success'
    }

    const checkId = await openStatusCheck()
    await addAnnotationsToStatusCheck(analyzedReport.annotations, checkId)

    if (markdownReportOnStepSummary) {
      await addSummary(analyzedReport.markdown)
    }

    if (postComment) {
      await addComment(analyzedReport.markdown)
    }

    await closeStatusCheck(
      conclusion,
      checkId,
      analyzedReport.summary,
      markdownReportOnStepSummary ? analyzedReport.markdown : '',
    )

    if ((failOnWarning && analyzedReport.warningCount > 0) || (failOnError && analyzedReport.errorCount > 0)) {
      core.setFailed(`${analyzedReport.errorCount} ESLint error(s) and ${analyzedReport.warningCount} ESLint warning(s) found`)
    }
  } catch (err) {
    if (err instanceof Error) {
      core.setFailed(err.message)
    } else {
      core.setFailed('An unexpected error occurred during ESLint report analysis.')
    }
  }

  core.info('ESLint report analysis complete.')
}

run()
