/**
 * Disable ESLint camel case check and the
 * GitHub API doesn't use it.
 * See https://developer.github.com/v3/checks/runs/#annotations-object-1
 */

import * as core from '@actions/core';

import { ESLintReport, AnalyzedESLintReport, AnnotationProperties } from './types';
import CONSTANTS from './constants';

const { GITHUB_WORKSPACE, OWNER, REPO, SHA } = CONSTANTS;
const failOnWarningInput = core.getInput('fail-on-warning') || '';
const failOnWarning = failOnWarningInput === 'true';

export default function analyzeESLintReport(lintedFiles: ESLintReport): AnalyzedESLintReport {
  // Start the error and warning counts at 0
  let errorCount = 0;
  let warningCount = 0;

  // Create text string placeholders
  let errorText = '';
  let warningText = '';
  let markdownText = '';

  // Create an array for annotations
  const annotations: AnnotationProperties[] = [];

  // Lopp through all linted files in the report
  for (const result of lintedFiles) {
    // Get the file path and any warning/error messages
    const { filePath, messages } = result;

    // Skip files with no error or warning messages
    if (!messages.length) {
      continue;
    }

    core.info(`Analyzing ${filePath}`);

    /**
     * Increment the error and warning counts by
     * the number of errors/warnings for this file
     */
    errorCount += result.errorCount;
    warningCount += result.warningCount;

    // Loop through all the error/warning messages for the file
    for (const lintMessage of messages) {
      // Pull out information about the error/warning message
      const { line, endLine, column, endColumn, severity, ruleId, message } = lintMessage;

      // Check if it a warning or error
      const isWarning = severity < 2;

      // Trim the absolute path prefix from the file path
      const filePathTrimmed = filePath.replace(`${GITHUB_WORKSPACE}/`, '');

      /**
       * Create a GitHub annotation object for the error/warning
       * See https://developer.github.com/v3/checks/runs/#annotations-object
       */
      const annotation: AnnotationProperties = {
        path: filePathTrimmed,
        start_line: line,
        end_line: endLine ? endLine : line,
        annotation_level: isWarning ? 'warning' : 'failure',
        message: `[${ruleId}] ${message}`,
      };

      /**
       * Start and end column can only be added to the
       * annotation if start_line and end_line are equal
       */
      if (line === endLine) {
        if (column !== null) {
          annotation.start_column = column;
        }
        if (endColumn !== null) {
          annotation.end_column = endColumn;
        }
      }

      // Add the annotation object to the array
      annotations.push(annotation);

      /**
       * Develop user-friendly markdown message
       * text for the error/warning
       */
      const link = `https://github.com/${OWNER}/${REPO}/blob/${SHA}/${filePathTrimmed}#L${line}:L${endLine}`;

      const messageText = [
        `### [${filePathTrimmed} line ${line}](${link})`,
        `- Start Line: ${line}`,
        `- End Lint: ${endLine}`,
        `- Message: ${message}`,
        `  - From: [${ruleId}]`,
        ``,
      ].join('\n');

      // Add the markdown text to the appropriate placeholder
      if (isWarning) {
        warningText += messageText;
      } else {
        errorText += messageText;
      }
    }
  }

  // If there is any markdown error text, add it to the markdown output
  if (errorText.length) {
    markdownText += `## ${errorCount} Error(s):\n${errorText}\n`;
  }

  // If there is any markdown warning text, add it to the markdown output
  if (warningText.length) {
    markdownText += `## ${warningCount} Warning(s):\n${warningText}\n`;
  }

  let success = errorCount === 0;
  if (failOnWarning && warningCount > 0) {
    success = false;
  }

  // Return the ESLint report analysis
  return {
    errorCount: errorCount,
    warningCount: warningCount,
    markdown: markdownText,
    success,
    summary: `${errorCount} ESLint error(s) and ${warningCount} ESLint warning(s) found`,
    annotations: annotations,
  };
}
