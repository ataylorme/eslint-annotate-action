import constants from './constants'
const {octokit} = constants

/**
 * Create step summary
 */
export default async function createStepSummary(summary: string, text: string): Promise<void> {
  const coreSummary = octokit.core.summary
  coreSummary.addRaw(summary)
  coreSummary.addRaw(text)
  await coreSummary.write()
}
