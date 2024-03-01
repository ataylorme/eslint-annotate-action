import getPullRequestFiles from './getPullRequestFiles'
import getAnalyzedReport from './getAnalyzedReport'
import type {ESLintReport, AnalyzedESLintReport} from './types'
import constants from './constants'
const {GITHUB_WORKSPACE, OWNER, REPO, pullRequest, onlyChangedFiles} = constants

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

  const analyzedPullRequestReport = getAnalyzedReport(pullRequestFilesReportJS)
  let summary = `${analyzedPullRequestReport.summary} in pull request changed files.`
  let markdown = `# Pull Request Changed Files ESLint Results:\n**${analyzedPullRequestReport.summary}**\n${analyzedPullRequestReport.markdown}`

  if (!onlyChangedFiles) {
    const nonPullRequestFilesReportJS: ESLintReport = reportJS.filter((file) => {
      file.filePath = file.filePath.replace(GITHUB_WORKSPACE + '/', '')
      return changedFiles.indexOf(file.filePath) === -1
    })

    const analyzedNonPullRequestReport = getAnalyzedReport(nonPullRequestFilesReportJS)

    summary += `${analyzedNonPullRequestReport.summary} in files outside of the pull request.`
    markdown += `\n\n# Non-Pull Request Changed Files ESLint Results:\n**${analyzedNonPullRequestReport.summary}**\n${analyzedNonPullRequestReport.markdown}`
  }

  return {
    errorCount: analyzedPullRequestReport.errorCount,
    warningCount: analyzedPullRequestReport.warningCount,
    markdown,
    success: analyzedPullRequestReport.success,
    summary,
    annotations: analyzedPullRequestReport.annotations,
  }
}
