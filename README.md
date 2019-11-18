# ESLint Annotate from Report JSON

Annotates pull request diffs with warnings and errors from an ESLint report JSON file.

## Usage Example

In `.github/workflows/nodejs.yml:

```yml
name: Example NodeJS Workflow

on: [pull_request]

jobs:
  node_test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v1
      - uses: webfactory/ssh-agent@v0.1.1
        with:
          ssh-private-key: ${{ secrets.GITHUB_SSH_PRIVATE_KEY }}
      - name: Node.JS 10.x
        uses: actions/setup-node@v1
        with:
          node-version: "10.x"
      - name: Cache node modules
        uses: actions/cache@v1
        with:
          path: node_modules
          key: ${{ runner.OS }}-build-${{ hashFiles('**/package-lock.json') }}
          restore-keys: |
            ${{ runner.OS }}-build-${{ env.cache-name }}-
            ${{ runner.OS }}-build-
            ${{ runner.OS }}-
      - name: Install Node Dependencies
        run: npm install
        env:
          CI: TRUE
      - name: Test Code Linting
        run: npm run lint
      - name: Save Code Linting Report JSON
        # npm script for ESLint
        # eslint --output-file eslint_report.json --format json src
        # See https://eslint.org/docs/user-guide/command-line-interface#options
        run: npm run lint:report
        # Continue to the next step even if this fails
        continue-on-error: true
      - name: Annotate Code Linting Results
        uses: ataylorme/eslint-annotate-action@preview
        with:
          repo-token: "${{ secrets.GITHUB_TOKEN }}"
          report-json: "eslint_report.json"
      - name: Upload ESLint report
        uses: actions/upload-artifact@v1
        with:
          name: eslint_report.json
          path: eslint_report.json