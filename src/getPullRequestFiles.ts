import type {prFilesParametersType, prFilesResponseType} from './types'
import constants from './constants'
const {octokit} = constants

/**
 * Get an array of files changed in a pull request
 * @param options the parameters for octokit.pulls.listFiles
 */
export default async function getPullRequestFiles(options: prFilesParametersType): Promise<string[]> {
  try {
    // https://developer.github.com/v3/pulls/#list-pull-requests-files
    // https://octokit.github.io/rest.js/v18#pulls-list-files
    // https://octokit.github.io/rest.js/v18#pagination
    const prFiles: prFilesResponseType['data'] = await octokit.paginate(
      'GET /repos/:owner/:repo/pulls/:pull_number/files',
      options,
    )
    const prFilesNames = prFiles.map((prFiles: prFilesResponseType['data']) => prFiles.filename)
    return Promise.resolve(prFilesNames)
  } catch (error) {
    return Promise.reject(error)
  }
}
