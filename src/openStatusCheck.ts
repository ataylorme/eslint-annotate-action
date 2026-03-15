import createStatusCheck from './createStatusCheck.js'
import constants from './constants.js'
const { OWNER, REPO, SHA, getTimestamp, checkName } = constants

/**
 * Creates a new in-progress GitHub check run and returns its ID.
 */
export default async function openStatusCheck(): Promise<number> {
  const response = await createStatusCheck({
    owner: OWNER,
    repo: REPO,
    started_at: getTimestamp(),
    head_sha: SHA,
    status: 'in_progress',
    name: checkName,
  })

  return response.id
}
