import * as core from '@actions/core'

/**
 * Appends markdown content to the GitHub Actions job summary.
 */
export default async function addSummary(markdown: string): Promise<void> {
  core.summary.addRaw(markdown)
  await core.summary.write()
}
