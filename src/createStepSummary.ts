import * as core from '@actions/core';

/**
 * Create step summary
 */
export default async function createStepSummary(summary: string, text: string): Promise<void> {
  core.summary.addRaw(summary);
  core.summary.addRaw(text);
  await core.summary.write();
}
