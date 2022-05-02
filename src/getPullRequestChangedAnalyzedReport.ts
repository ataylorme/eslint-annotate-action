import getPullRequestFiles from './getPullRequestFiles'
import getAnalyzedReport from './getAnalyzedReport'
import type {ESLintReport, AnalyzedESLintReport} from './types'
import constants from './constants'
const {GITHUB_WORKSPACE, OWNER, REPO, pullRequest} = constants

/**
 * Analyzes an ESLint report, separating pull request changed files
 * @param reportJS a JavaScript representation of an ESLint JSON report
 */
export default async function getPullRequestChangedAnalyzedReport(
  reportJS: ESLintReport,
): Promise<AnalyzedESLintReport> {
  const changedFiles = await getPullRequestFiles({
    owner: OWNER,
    repo: REPO,
    pull_number: pullRequest.number,
  })
  // Separate lint reports for PR and non-PR files
  const pullRequestFilesReportJS: ESLintReport = reportJS.filter((file) => {
    file.filePath = file.filePath.replace(GITHUB_WORKSPACE + '/', '')
    return changedFiles.indexOf(file.filePath) !== -1
  })
  const nonPullRequestFilesReportJS: ESLintReport = reportJS.filter((file) => {
    file.filePath = file.filePath.replace(GITHUB_WORKSPACE + '/', '')
    return changedFiles.indexOf(file.filePath) === -1
  })
  const analyzedPullRequestReport = getAnalyzedReport(pullRequestFilesReportJS)
  const analyzedNonPullRequestReport = getAnalyzedReport(nonPullRequestFilesReportJS)
  const combinedSummary = `
${analyzedPullRequestReport.summary} in pull request changed files.
${analyzedNonPullRequestReport.summary} in files outside of the pull request.
`
  const combinedMarkdown = `
# Pull Request Changed Files ESLint Results:
**${analyzedPullRequestReport.summary}**
${analyzedPullRequestReport.markdown}
# Non-Pull Request Changed Files ESLint Results:
**${analyzedNonPullRequestReport.summary}**
${analyzedNonPullRequestReport.markdown}
`
  return {
    errorCount: analyzedPullRequestReport.errorCount,
    warningCount: analyzedPullRequestReport.warningCount,
    markdown: combinedMarkdown,
    success: analyzedPullRequestReport.success,
    summary: combinedSummary,
    annotations: analyzedPullRequestReport.annotations,
  }
}
