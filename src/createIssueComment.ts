import constants from './constants'
const {octokit} = constants
import type {createIssueCommentParametersType, createIssueCommentResponseDataType} from './types'

/**
 * Create a new issue comment on GitHub
 * @param options octokit.issues.createComment parameters
 */
export default async function createIssueComment(
  options: createIssueCommentParametersType,
): Promise<createIssueCommentResponseDataType> {
  try {
    // https://docs.github.com/en/rest/issues/comments?apiVersion=2022-11-28#create-an-issue-comment
    // https://octokit.github.io/rest.js/v21/#issues-create-comment
    const response = await octokit.issues.createComment(options)

    return Promise.resolve(response.data)
  } catch (error) {
    return Promise.reject(error)
  }
}
