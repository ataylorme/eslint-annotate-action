import {AnalyzedESLintReport} from '../types'

/* eslint-disable */

const reportAnalyzedExpected: AnalyzedESLintReport = {
  errorCount: 1,
  warningCount: 0,
  markdown: '## 1 Error(s):\n' +
    '### [`src/index.ts` line `10`](https://github.com/ataylorme/eslint-annotate-github-action/blob/8e80ec28fec6ef9763aacbabb452bcb5d92315ca/src/index.ts#L10:L10)\n' +
    '- Start Line: `10`\n' +
    '- End Line: `10`\n' +
    "- Message: Unused eslint-disable directive (no problems were reported from '@typescript-eslint/no-unused-vars').\n" +
    '  - From: [`null`]\n' +
    '\n',
  success: false,
  summary: '1 ESLint error(s) and 0 ESLint warning(s) found',
  annotations: [
    {
      path: 'src/index.ts',
      start_line: 10,
      end_line: 10,
      annotation_level: 'failure',
      message: "[null] Unused eslint-disable directive (no problems were reported from '@typescript-eslint/no-unused-vars').",
      start_column: 3,
      end_column: 3
    }
  ]
}

/* eslint-enable */

export default reportAnalyzedExpected
