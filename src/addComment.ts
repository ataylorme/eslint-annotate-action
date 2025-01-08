import createIssueComment from './createIssueComment'
import constants from './constants'
import {AnalyzedESLintReport} from './types'
const {OWNER, REPO, pullRequest, octokit, core} = constants

/**
 * Adds a comment to the PR with the results of the analysis
 * @param summary the (markdown) body of the comment
 * @return the id of the created comment
 */
export default async function addComment(report: AnalyzedESLintReport, checkId: number): Promise<number> {
  const linkPre = `[See full ESlint report](${pullRequest.html_url}/checks?check_run_id=`
  const linkPost = `)`

  let icon
  if (report.errorCount > 0) {
    icon = '❌'
  } else if (report.warningCount > 0) {
    icon = '⚠️'
  } else {
    icon = '✅'
  }

  const body = `## ${icon} ESlint summary\n\n${report.summary}\n\n ${linkPre}${checkId}${linkPost}`

  // Delete an existing comment that matches the first part of the link
  // The checkId will be different on every run, so qwe cannot use it to search for the link
  await deleteComment(linkPre)

  const createCommentResponse = await createIssueComment({
    owner: OWNER,
    repo: REPO,
    issue_number: pullRequest.number,
    body: body,
  })

  core.debug(`Created comment ${createCommentResponse.id}`)
  return createCommentResponse.id as number
}

// Private function to delete an existing comment given text to search for
async function deleteComment(shouldContainText: string): Promise<void> {
  const comments = await octokit.issues.listComments({
    owner: OWNER,
    repo: REPO,
    issue_number: pullRequest.number,
  })

  // Find the first comment that contains the text.
  // Will search up to 100 comments, which can be increased by adding the
  // `per_page` parameter or by iterating over pages
  const myComment = comments.data.find((comment) => comment.body?.includes(shouldContainText))
  const commentId = myComment ? myComment.id : null
  if (commentId) {
    core.debug(`Found comment ${commentId}`)
    const deleteResult = await octokit.issues.deleteComment({
      owner: OWNER,
      repo: REPO,
      comment_id: commentId,
    })
    if (deleteResult.status >= 200 && deleteResult.status < 300) {
      core.debug(`Deleted existing comment ${commentId}`)
    } else {
      core.warning(`Unable to delete comment ${commentId}: ${deleteResult.data}`)
    }
  } else {
    core.debug(`No existing comment found with text ${shouldContainText}`)
  }
}
