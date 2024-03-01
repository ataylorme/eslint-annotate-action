# `3.0.0` - CONTAINS BREAKING CHANGES

- Rename the `repo-token` input to `GITHUB_TOKEN`
- Run the Action itself on Node 20 instead of Node 16
- Truncate summary if too long
- Only add changed file to markdown summary if only changed files is true
- Use `@octokit/action` instead of `actions-toolkit`
- Use ESLint types from `@types/eslint` instead of custom types
- Default line to 1 if it's not present