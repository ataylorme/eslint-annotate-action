import updateStatusCheck from './updateStatusCheck.js'
import type { CheckAnnotation } from './types.js'
import constants from './constants.js'
const { OWNER, REPO, core, checkName } = constants

const BATCH_SIZE = 50

/**
 * Uploads annotations to a GitHub check run in batches of 50 (GitHub API limit).
 */
export default async function addAnnotationsToStatusCheck(
  annotations: CheckAnnotation[],
  checkId: number,
): Promise<void> {
  const total = annotations.length

  // Work on a copy so callers are not surprised by mutation
  const remaining = [...annotations]

  let batch = 1
  const numBatches = Math.ceil(total / BATCH_SIZE)

  while (remaining.length > 0) {
    const batchMessage = `Found ${total} ESLint errors and warnings, processing batch ${batch} of ${numBatches}...`
    core.info(batchMessage)

    const annotationBatch = remaining.splice(0, BATCH_SIZE)

    await updateStatusCheck({
      owner: OWNER,
      repo: REPO,
      check_run_id: checkId,
      status: 'in_progress',
      output: {
        title: checkName,
        summary: batchMessage,
        annotations: annotationBatch,
      },
    })

    batch++
  }
}
