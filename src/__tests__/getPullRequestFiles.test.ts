import getPrFiles from '../getPullRequestFiles'

describe('get PR files', () => {
  it('returns an array of PR files', async () => {
    const prFilesExpected = [
      '.vscode/settings.json',
      'action.yml',
      'dist/index.js',
      'jest.config.js',
      'package-lock.json',
      'package.json',
      'src/analyze-eslint-js.ts',
      'src/constants.ts',
      'src/eslint-action.ts',
      'src/eslint-json-report-to-js.ts',
      'src/get-pr-files-changed.ts',
      'src/split-array-into-chunks.ts',
      'src/types.d.ts',
      'tsconfig.json',
    ]
    const prFiles = await getPrFiles({owner: 'ataylorme', repo: 'eslint-annotate-action', pull_number: 3})
    // https://jestjs.io/docs/en/expect#expectarraycontainingarray
    expect(prFiles).toEqual(expect.arrayContaining(prFilesExpected))
  })
})
