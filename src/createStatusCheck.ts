import constants from './constants'
const {octokit} = constants
import type {checkCreateParametersType, createCheckRunResponseDataType} from './types'

/**
 * Create a new GitHub check run
 * @param options octokit.checks.create parameters
 */
export default async function createStatusCheck(
  options: checkCreateParametersType,
): Promise<createCheckRunResponseDataType> {
  try {
    // https://developer.github.com/v3/checks/runs/#create-a-check-run
    // https://octokit.github.io/rest.js/v16#checks-create
    const response = await octokit.checks.create(options)
    return Promise.resolve(response.data)
  } catch (error) {
    return Promise.reject(error)
  }
}
