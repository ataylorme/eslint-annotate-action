import type { AnalyzedESLintReport } from '../types.js'

const reportAnalyzedExpected: AnalyzedESLintReport = {
  errorCount: 1,
  warningCount: 0,
  markdown:
    '## 1 Error(s):\n' +
    '### [`src/broken.ts` line `5`](https://github.com/ataylorme/eslint-annotate-github-action/blob/8e80ec28fec6ef9763aacbabb452bcb5d92315ca/src/broken.ts#L5:L5)\n' +
    '- Start Line: `5`\n' +
    '- End Line: `5`\n' +
    '- Message: Parsing error: Unexpected token\n' +
    '  - From: [`parse error`]\n' +
    '\n',
  success: false,
  summary: '1 ESLint error(s) and 0 ESLint warning(s) found',
  annotations: [
    {
      path: 'src/broken.ts',
      start_line: 5,
      end_line: 5,
      annotation_level: 'failure',
      message: '[parse error] Parsing error: Unexpected token',
      start_column: 10,
      end_column: 10,
    },
  ],
}

export default reportAnalyzedExpected
