import type { AnalyzedESLintReport } from '../types.js'

const reportAnalyzedExpected: AnalyzedESLintReport = {
  errorCount: 0,
  warningCount: 1,
  markdown:
    '## 1 Warning(s):\n' +
    '### [`src/app.ts` line `5`](https://github.com/ataylorme/eslint-annotate-github-action/blob/8e80ec28fec6ef9763aacbabb452bcb5d92315ca/src/app.ts#L5:L5)\n' +
    '- Start Line: `5`\n' +
    '- End Line: `5`\n' +
    '- Message: Unexpected console statement.\n' +
    '  - From: [`no-console`]\n' +
    '\n',
  success: true,
  summary: '0 ESLint error(s) and 1 ESLint warning(s) found',
  annotations: [
    {
      path: 'src/app.ts',
      start_line: 5,
      end_line: 5,
      annotation_level: 'warning',
      message: '[no-console] Unexpected console statement.',
      start_column: 1,
      end_column: 12,
    },
  ],
}

export default reportAnalyzedExpected
