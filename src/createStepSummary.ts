import constants from './constants'
const {octokit} = constants

/**
 * Create step summary
 */
export default async function createStepSummary(summary: string): Promise<void> {
    await octokit.core.summary
      .addRaw(summary)
      .write()
}
