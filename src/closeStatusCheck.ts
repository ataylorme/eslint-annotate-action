import updateStatusCheck from './updateStatusCheck'
import constants from './constants'
const {OWNER, REPO, getTimestamp, checkName, runId} = constants
import type {checkUpdateParametersType} from './types'

/**
 *
 * @param conclusion whether or not the status check was successful. Must be one of: success, failure, neutral, cancelled, skipped, timed_out, or action_required.
 * @param checkId the ID of the check run to close
 * @param summary a markdown summary of the check run results
 */
export default async function closeStatusCheck(
  conclusion: checkUpdateParametersType['conclusion'],
  checkId: checkUpdateParametersType['check_run_id'],
  summary: string,
): Promise<void> {
  await updateStatusCheck({
    conclusion,
    owner: OWNER,
    repo: REPO,
    completed_at: getTimestamp(),
    status: 'completed',
    check_run_id: checkId,
    external_id: runId,
    output: {
      title: checkName,
      summary: summary,
    },
    /**
     * The check run API is still in beta and the developer preview must be opted into
     * See https://developer.github.com/changes/2018-05-07-new-checks-api-public-beta/
     */
    mediaType: {
      previews: ['antiope'],
    },
  })
}
