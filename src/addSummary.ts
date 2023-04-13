import * as core from '@actions/core'

/**
 * Add to job summary
 */
export default async function addSummary(summary: string): Promise<void> {
  core.summary.addRaw(summary)
  await core.summary.write()
}
