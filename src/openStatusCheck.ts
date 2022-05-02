import createStatusCheck from './createStatusCheck'
import constants from './constants'
const {OWNER, REPO, SHA, getTimestamp, checkName} = constants

/**
 * Open a new, in-progress GitHub check run
 * @return the check ID of the created run
 */
export default async function openStatusCheck(): Promise<number> {
  // Create a new status check and leave it in-progress
  const createCheckResponse = await createStatusCheck({
    owner: OWNER,
    repo: REPO,
    started_at: getTimestamp(),
    head_sha: SHA,
    status: 'in_progress',
    name: checkName,
    /**
     * The check run API is still in beta and the developer preview must be opted into
     * See https://developer.github.com/changes/2018-05-07-new-checks-api-public-beta/
     */
    mediaType: {
      previews: ['antiope'],
    },
  })

  // Return the status check ID
  return createCheckResponse.id as number
}
