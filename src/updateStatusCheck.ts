import { octokit } from './constants.js'
import type { CheckUpdateParams, CheckUpdateData } from './types.js'

/**
 * Updates an existing GitHub check run.
 */
export default async function updateStatusCheck(options: CheckUpdateParams): Promise<CheckUpdateData> {
  const response = await octokit.rest.checks.update(options)
  return response.data
}
