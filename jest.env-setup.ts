// Sets environment variables before any test modules are imported.
// Must use setupFiles (not setupFilesAfterEnv) so these are available
// when constants.ts initialises its module-level singletons.

process.env['GITHUB_ACTION'] = '1'
process.env['INPUT_GITHUB-TOKEN'] = 'secret123'
process.env['INPUT_REPORT-JSON'] = 'src/__tests__/eslintReport-3-errors.json'
process.env['INPUT_ONLY-PR-FILES'] = 'false'
process.env['INPUT_FAIL-ON-WARNING'] = 'false'
process.env['INPUT_FAIL-ON-ERROR'] = 'true'
process.env['INPUT_NEUTRAL-ON-WARNING'] = 'false'
process.env['INPUT_CHECK-NAME'] = 'ESLint Report Analysis'
process.env['INPUT_MARKDOWN-REPORT-ON-STEP-SUMMARY'] = 'false'
process.env['INPUT_POST-COMMENT'] = 'false'
process.env['GITHUB_SHA'] = '8e80ec28fec6ef9763aacbabb452bcb5d92315ca'
process.env['GITHUB_REPOSITORY'] = 'ataylorme/eslint-annotate-github-action'
