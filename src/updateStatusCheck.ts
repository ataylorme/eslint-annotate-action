import constants, { octokit } from './constants.js'
import type { CheckUpdateParams, CheckUpdateData } from './types.js'
const { core } = constants

const MAX_ATTEMPTS = 4

function isNotFoundError(err: unknown): boolean {
  return typeof err === 'object' && err !== null && 'status' in err && err.status === 404
}

/**
 * Updates an existing GitHub check run.
 * GitHub can answer 404 for a short time right after a check run is created, so a 404 is retried with a growing wait.
 */
export default async function updateStatusCheck(options: CheckUpdateParams): Promise<CheckUpdateData> {
  for (let attempt = 1; ; attempt++) {
    try {
      const response = await octokit.rest.checks.update(options)
      return response.data
    } catch (err) {
      if (!isNotFoundError(err) || attempt === MAX_ATTEMPTS) {
        throw err
      }
      const delayMs = 1000 * 2 ** (attempt - 1)
      core.info(`Check run ${options.check_run_id} not found yet, retrying in ${delayMs / 1000}s...`)
      await new Promise((resolve) => setTimeout(resolve, delayMs))
    }
  }
}
