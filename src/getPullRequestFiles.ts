import { octokit } from './constants.js'

/**
 * Returns the list of filenames changed in a pull request.
 */
export default async function getPullRequestFiles(owner: string, repo: string, pullNumber: number): Promise<string[]> {
  const files = await octokit.paginate(octokit.rest.pulls.listFiles, {
    owner,
    repo,
    pull_number: pullNumber,
  })
  return files.map((f) => f.filename)
}
