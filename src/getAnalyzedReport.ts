import type { ESLintReport, CheckAnnotation, AnalyzedESLintReport } from './types.js'
import constants from './constants.js'
const { core, GITHUB_WORKSPACE, OWNER, REPO, SHA, unusedDirectiveMessagePrefix } = constants

/**
 * Analyzes an ESLint report JS object and returns a report.
 * @param files - JavaScript representation of an ESLint JSON report
 * @param failOnWarningOverride - Override constants.failOnWarning (useful for testing)
 */
export default function getAnalyzedReport(files: ESLintReport, failOnWarningOverride?: boolean): AnalyzedESLintReport {
  const failOnWarning = failOnWarningOverride ?? constants.failOnWarning

  let markdownText = ''
  let errorCount = 0
  let warningCount = 0
  let errorText = ''
  let warningText = ''
  const annotations: CheckAnnotation[] = []

  for (const file of files) {
    const { filePath, messages } = file

    core.info(`Analyzing ${filePath}`)

    if (!messages.length) {
      continue
    }

    errorCount += file.errorCount
    warningCount += file.warningCount

    for (const lintMessage of messages) {
      const { column, severity, ruleId, message } = lintMessage
      let { line } = lintMessage
      if (!line) {
        line = 1
      }

      // Determine the display label for the rule.
      // - ruleId present: use it directly
      // - ruleId null + fatal: parse error
      // - ruleId null + unused-directive message: show without a rule prefix
      // - ruleId null + other: skip (e.g. ignored-file notices)
      const isFatal = lintMessage.fatal === true
      const isUnusedDirective = message.startsWith(unusedDirectiveMessagePrefix)

      if (ruleId === null && !isFatal && !isUnusedDirective) continue

      const ruleLabel = ruleId !== null ? ruleId : isFatal ? 'parse error' : null

      const endLine = lintMessage.endLine !== undefined ? lintMessage.endLine : line
      const endColumn = lintMessage.endColumn !== undefined ? lintMessage.endColumn : column

      const isWarning = severity < 2

      // Strip the workspace prefix only when GITHUB_WORKSPACE is set and the path starts with it
      const filePathTrimmed =
        GITHUB_WORKSPACE && filePath.startsWith(GITHUB_WORKSPACE)
          ? filePath.slice(GITHUB_WORKSPACE.length + 1)
          : filePath

      const annotationMessage = ruleLabel !== null ? `[${ruleLabel}] ${message}` : message

      const annotation: CheckAnnotation = {
        path: filePathTrimmed,
        start_line: line,
        end_line: endLine,
        annotation_level: isWarning ? 'warning' : 'failure',
        message: annotationMessage,
      }

      // GitHub API only accepts column info when start_line === end_line
      if (line === endLine) {
        annotation.start_column = column
        annotation.end_column = endColumn
      }

      annotations.push(annotation)

      const link = `https://github.com/${OWNER}/${REPO}/blob/${SHA}/${filePathTrimmed}#L${line}:L${endLine}`
      const fromLabel = ruleLabel ?? 'unused-disable-directive'

      let messageText = `### [\`${filePathTrimmed}\` line \`${line.toString()}\`](${link})\n`
      messageText += '- Start Line: `' + line.toString() + '`\n'
      messageText += '- End Line: `' + endLine.toString() + '`\n'
      messageText += '- Message: ' + message + '\n'
      messageText += '  - From: [`' + fromLabel + '`]\n'

      if (isWarning) {
        warningText += messageText
      } else {
        errorText += messageText
      }
    }
  }

  if (errorText.length) {
    markdownText += '## ' + errorCount.toString() + ' Error(s):\n'
    markdownText += errorText + '\n'
  }

  if (warningText.length) {
    markdownText += '## ' + warningCount.toString() + ' Warning(s):\n'
    markdownText += warningText + '\n'
  }

  let success = errorCount === 0
  if (failOnWarning && warningCount > 0) {
    success = false
  }

  return {
    errorCount,
    warningCount,
    markdown: markdownText,
    success,
    summary: `${errorCount} ESLint error(s) and ${warningCount} ESLint warning(s) found`,
    annotations,
  }
}
