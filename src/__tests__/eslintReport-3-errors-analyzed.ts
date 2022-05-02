import {AnalyzedESLintReport} from '../types'

/* eslint-disable */

const reportAnalyzedExpected: AnalyzedESLintReport = {
  errorCount: 3,
  warningCount: 0,
  markdown:
    '## 3 Error(s):\n' +
    '### [`src/__tests__/eslintJsonReportToJs.test.ts` line `20`](https://github.com/ataylorme/eslint-annotate-github-action/blob/8e80ec28fec6ef9763aacbabb452bcb5d92315ca/src/__tests__/eslintJsonReportToJs.test.ts#L20:L20)\n' +
    '- Start Line: `20`\n' +
    '- End Line: `20`\n' +
    '- Message: Delete `;`\n' +
    '  - From: [`prettier/prettier`]\n' +
    '### [`src/__tests__/eslintJsonReportToJs.test.ts` line `21`](https://github.com/ataylorme/eslint-annotate-github-action/blob/8e80ec28fec6ef9763aacbabb452bcb5d92315ca/src/__tests__/eslintJsonReportToJs.test.ts#L21:L21)\n' +
    '- Start Line: `21`\n' +
    '- End Line: `21`\n' +
    '- Message: Delete `;`\n' +
    '  - From: [`prettier/prettier`]\n' +
    '### [`src/__tests__/eslintJsonReportToJs.test.ts` line `25`](https://github.com/ataylorme/eslint-annotate-github-action/blob/8e80ec28fec6ef9763aacbabb452bcb5d92315ca/src/__tests__/eslintJsonReportToJs.test.ts#L25:L25)\n' +
    '- Start Line: `25`\n' +
    '- End Line: `25`\n' +
    '- Message: Insert `⏎`\n' +
    '  - From: [`prettier/prettier`]\n' +
    '\n',
  success: false,
  summary: '3 ESLint error(s) and 0 ESLint warning(s) found',
  annotations: [
    {
      path: 'src/__tests__/eslintJsonReportToJs.test.ts',
      start_line: 20,
      end_line: 20,
      annotation_level: 'failure',
      message: '[prettier/prettier] Delete `;`',
      start_column: 6,
      end_column: 7,
    },
    {
      path: 'src/__tests__/eslintJsonReportToJs.test.ts',
      start_line: 21,
      end_line: 21,
      annotation_level: 'failure',
      message: '[prettier/prettier] Delete `;`',
      start_column: 52,
      end_column: 53,
    },
    {
      path: 'src/__tests__/eslintJsonReportToJs.test.ts',
      start_line: 25,
      end_line: 25,
      annotation_level: 'failure',
      message: '[prettier/prettier] Insert `⏎`',
      start_column: 3,
      end_column: 3,
    },
  ],
}

/* eslint-enable */

export default reportAnalyzedExpected
