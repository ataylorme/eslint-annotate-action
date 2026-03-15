import updateStatusCheck from './updateStatusCheck.js'
import constants from './constants.js'
import type { CheckUpdateParams } from './types.js'
const { OWNER, REPO, getTimestamp, checkName } = constants

/**
 * Closes a GitHub check run with a final conclusion.
 * @param conclusion - 'success' | 'failure' | 'neutral' | 'cancelled' | 'skipped' | 'timed_out' | 'action_required'
 */
export default async function closeStatusCheck(
  conclusion: CheckUpdateParams['conclusion'],
  checkId: number,
  summary: string,
  text: string,
): Promise<void> {
  await updateStatusCheck({
    conclusion,
    owner: OWNER,
    repo: REPO,
    completed_at: getTimestamp(),
    status: 'completed',
    check_run_id: checkId,
    output: {
      title: checkName,
      summary,
      text,
    },
  })
}
