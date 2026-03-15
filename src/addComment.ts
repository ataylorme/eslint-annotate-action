import { octokit } from './constants.js'
import constants from './constants.js'
const { OWNER, REPO, pullRequest } = constants

// Hidden marker so we can find and replace a previous comment from this action
const COMMENT_MARKER = '<!-- eslint-annotate-action -->'

/**
 * Posts (or replaces) a pull request comment with the ESLint markdown report.
 * Silently no-ops when not running in a pull_request context.
 */
export default async function addComment(markdown: string): Promise<void> {
  if (!pullRequest) return

  // Find any existing comment left by a previous run of this action
  const comments = await octokit.rest.issues.listComments({
    owner: OWNER,
    repo: REPO,
    issue_number: pullRequest.number,
  })

  const existing = comments.data.find((c) => c.body?.includes(COMMENT_MARKER))

  if (existing) {
    await octokit.rest.issues.deleteComment({
      owner: OWNER,
      repo: REPO,
      comment_id: existing.id,
    })
  }

  await octokit.rest.issues.createComment({
    owner: OWNER,
    repo: REPO,
    issue_number: pullRequest.number,
    body: `${COMMENT_MARKER}\n${markdown}`,
  })
}
