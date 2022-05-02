import {AnalyzedESLintReport} from '../types'

/* eslint-disable */

const reportAnalyzedExpected: AnalyzedESLintReport = {
  errorCount: 3,
  warningCount: 0,
  markdown:
    '## 3 Error(s):\n' +
    '### [`src/form-validation/FormValidatorStrategyFactory.ts` line `18`](https://github.com/ataylorme/eslint-annotate-github-action/blob/8e80ec28fec6ef9763aacbabb452bcb5d92315ca/src/form-validation/FormValidatorStrategyFactory.ts#L18:L18)\n' +
    '- Start Line: `18`\n' +
    '- End Line: `18`\n' +
    '- Message: Expected indentation of 6 spaces but found 4.\n' +
    '  - From: [`indent`]\n' +
    '### [`src/form-validation/FormValidatorStrategyFactory.ts` line `18`](https://github.com/ataylorme/eslint-annotate-github-action/blob/8e80ec28fec6ef9763aacbabb452bcb5d92315ca/src/form-validation/FormValidatorStrategyFactory.ts#L18:L18)\n' +
    '- Start Line: `18`\n' +
    '- End Line: `18`\n' +
    '- Message: Unexpected newline between object and [ of property access.\n' +
    '  - From: [`no-unexpected-multiline`]\n' +
    '### [`src/form-validation/FormValidatorStrategyFactory.ts` line `18`](https://github.com/ataylorme/eslint-annotate-github-action/blob/8e80ec28fec6ef9763aacbabb452bcb5d92315ca/src/form-validation/FormValidatorStrategyFactory.ts#L18:L18)\n' +
    '- Start Line: `18`\n' +
    '- End Line: `18`\n' +
    '- Message: Unexpected use of comma operator.\n' +
    '  - From: [`no-sequences`]\n' +
    '\n',
  success: false,
  summary: '3 ESLint error(s) and 0 ESLint warning(s) found',
  annotations: [
    {
      path: 'src/form-validation/FormValidatorStrategyFactory.ts',
      start_line: 18,
      end_line: 18,
      annotation_level: 'failure',
      message: '[indent] Expected indentation of 6 spaces but found 4.',
      start_column: 1,
      end_column: 5,
    },
    {
      path: 'src/form-validation/FormValidatorStrategyFactory.ts',
      start_line: 18,
      end_line: 18,
      annotation_level: 'failure',
      message: '[no-unexpected-multiline] Unexpected newline between object and [ of property access.',
      start_column: 5,
      end_column: 5,
    },
    {
      path: 'src/form-validation/FormValidatorStrategyFactory.ts',
      start_line: 18,
      end_line: 18,
      annotation_level: 'failure',
      message: '[no-sequences] Unexpected use of comma operator.',
      start_column: 12,
      end_column: 13,
    },
  ],
}

/* eslint-enable */

export default reportAnalyzedExpected
