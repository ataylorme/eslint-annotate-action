import { octokit } from './constants.js'
import type { CheckCreateParams, CheckCreateData } from './types.js'

/**
 * Creates a new GitHub check run.
 */
export default async function createStatusCheck(options: CheckCreateParams): Promise<CheckCreateData> {
  const response = await octokit.rest.checks.create(options)
  return response.data
}
