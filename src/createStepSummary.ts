import * as core from '@actions/core';

/**
 * Create step summary
 */
export default async function createStepSummary(summary: string): Promise<void> {
  core.summary.addRaw(summary);
  await core.summary.write();
}
