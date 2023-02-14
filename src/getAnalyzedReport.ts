import type {ESLintReport, ChecksUpdateParamsOutputAnnotations, AnalyzedESLintReport} from './types'
import constants from './constants'
const {toolkit, GITHUB_WORKSPACE, OWNER, REPO, SHA, failOnWarning, UNUSED_DIRECTIVE_MESSAGE_PREFIX} = constants

/**
 * Analyzes an ESLint report JS object and returns a report
 * @param files a JavaScript representation of an ESLint JSON report
 */
export default function getAnalyzedReport(files: ESLintReport): AnalyzedESLintReport {
  // Create markdown placeholder
  let markdownText = ''

  // Start the error and warning counts at 0
  let errorCount = 0
  let warningCount = 0

  // Create text string placeholders
  let errorText = ''
  let warningText = ''

  // Create an array for annotations
  const annotations: ChecksUpdateParamsOutputAnnotations[] = []

  // Loop through each file
  for (const file of files) {
    // Get the file path and any warning/error messages
    const {filePath, messages} = file

    toolkit.log.info(`Analyzing ${filePath}`)

    // Skip files with no error or warning messages
    if (!messages.length) {
      continue
    }

    /**
     * Increment the error and warning counts by
     * the number of errors/warnings for this file
     * and note files in the PR
     */
    errorCount += file.errorCount
    warningCount += file.warningCount

    // Loop through all the error/warning messages for the file
    for (const lintMessage of messages) {
      // Pull out information about the error/warning message
      const {line, column, severity, ruleId, message} = lintMessage

      // If there's no rule ID (e.g. an ignored file warning) and it isn't from --report-unused-disable-directives, skip
      if (!ruleId && !message.startsWith(UNUSED_DIRECTIVE_MESSAGE_PREFIX)) continue

      const endLine = lintMessage.endLine ? lintMessage.endLine : line
      const endColumn = lintMessage.endColumn ? lintMessage.endColumn : column

      // Check if it a warning or error
      const isWarning = severity < 2

      // Trim the absolute path prefix from the file path
      const filePathTrimmed: string = filePath.replace(`${GITHUB_WORKSPACE}/`, '')

      /**
       * Create a GitHub annotation object for the error/warning
       * See https://developer.github.com/v3/checks/runs/#annotations-object
       */
      const annotation: ChecksUpdateParamsOutputAnnotations = {
        path: filePathTrimmed,
        start_line: line,
        end_line: endLine,
        annotation_level: isWarning ? 'warning' : 'failure',
        message: `[${ruleId}] ${message}`,
      }

      /**
       * Start and end column can only be added to the
       * annotation if start_line and end_line are equal
       */
      if (line === endLine) {
        annotation.start_column = column
        if (endColumn !== null) {
          annotation.end_column = endColumn
        }
      }

      // Add the annotation object to the array
      annotations.push(annotation)

      /**
       * Develop user-friendly markdown message
       * text for the error/warning
       */
      const link = `https://github.com/${OWNER}/${REPO}/blob/${SHA}/${filePathTrimmed}#L${line}:L${endLine}`

      let messageText = `### [\`${filePathTrimmed}\` line \`${line.toString()}\`](${link})\n`
      messageText += '- Start Line: `' + line.toString() + '`\n'
      messageText += '- End Line: `' + endLine.toString() + '`\n'
      messageText += '- Message: ' + message + '\n'
      messageText += '  - From: [`' + ruleId + '`]\n'

      // Add the markdown text to the appropriate placeholder
      if (isWarning) {
        warningText += messageText
      } else {
        errorText += messageText
      }
    }
  }

  // If there is any markdown error text, add it to the markdown output
  if (errorText.length) {
    markdownText += '## ' + errorCount.toString() + ' Error(s):\n'
    markdownText += errorText + '\n'
  }

  // If there is any markdown warning text, add it to the markdown output
  if (warningText.length) {
    markdownText += '## ' + warningCount.toString() + ' Warning(s):\n'
    markdownText += warningText + '\n'
  }

  let success = errorCount === 0
  if (failOnWarning && warningCount > 0) {
    success = false
  }

  // Return the ESLint report analysis
  return {
    errorCount,
    warningCount,
    markdown: markdownText,
    success,
    summary: `${errorCount} ESLint error(s) and ${warningCount} ESLint warning(s) found`,
    annotations,
  }
}
