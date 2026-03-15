# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run package      # Compile TypeScript + bundle with rollup → dist/index.js
npm run lint         # ESLint check on src/
npm run lint:fix     # Auto-fix ESLint violations
npm run lint:report  # Generate eslint_report.json (used for testing)
npm test             # Run Jest tests
```

**Run a single test file:**
```bash
npx jest src/__tests__/getAnalyzedReport.test.ts
```

The `dist/` directory must be committed — it contains the bundled action used by GitHub runners.

## Architecture

This is a GitHub Action (Node 24, ESM) that reads ESLint JSON report files and posts results as GitHub Check annotations. TypeScript source in `src/` is bundled into `dist/index.js` via rollup.

**Execution pipeline in `src/index.ts`:**

1. **Load config** (`constants.ts`) — reads `action.yml` inputs, GitHub context (repo, SHA, PR info), initializes Octokit via `@actions/github`'s `getOctokit`
2. **Parse report** (`eslintJsonReportToJs.ts`) — accepts glob patterns via `@actions/glob`, reads/merges JSON files; throws if no files match
3. **Analyze** (`getAnalyzedReport.ts`) — converts ESLint findings to GitHub annotations; if PR event, `getPullRequestChangedAnalyzedReport.ts` filters to only changed files via `getPullRequestFiles.ts`
4. **Open check** (`openStatusCheck.ts`) — creates a GitHub Check in `in_progress` state
5. **Upload annotations** (`addAnnotationsToStatusCheck.ts`) — batches into groups of 50 (GitHub API limit) and uploads
6. **Write summary** (`addSummary.ts`) — optionally writes markdown to GitHub job summary
7. **Close check** (`closeStatusCheck.ts`) — sets conclusion (`success`/`failure`/`neutral`) and final output markdown
8. **Post comment** (`addComment.ts`) — if `post-comment: true`, upserts a PR comment using a hidden HTML marker

**Key files:**
- `src/constants.ts` — all inputs, GitHub context, Octokit client (`octokit.rest.*`)
- `src/types.d.ts` — TypeScript interfaces for ESLint report format and GitHub annotation types; uses `@octokit/plugin-rest-endpoint-methods` for API param types
- `src/getAnalyzedReport.ts` — core logic: null ruleId handling (fatal parse errors, unused-directive messages), severity→annotation_level mapping, `GITHUB_WORKSPACE` prefix stripping, markdown generation

**Annotation constraints (GitHub API):**
- Max 50 annotations per API call (handled by batching in `addAnnotationsToStatusCheck.ts`)
- Column info only included when `start_line === end_line`
- File paths must be relative (workspace prefix stripped)

**ESLint JSON report spec:** `ruleId` may be `null` (fatal parse errors have `fatal: true`; `--report-unused-disable-directives` produces null ruleId with non-fatal messages). See https://eslint.org/docs/latest/use/formatters/

## Action Inputs / Outputs

Defined in `action.yml`. Key inputs: `report-json` (glob pattern), `only-pr-files` (bool), `fail-on-warning` (bool), `fail-on-error` (bool, default true), `neutral-on-warning` (bool), `post-comment` (bool). Outputs: `summary`, `errorCount`, `warningCount`.

## Testing

Tests use Jest with ESM support (`NODE_OPTIONS=--experimental-vm-modules`). ESM module mocking uses `jest.unstable_mockModule` + dynamic `await import()` after mock setup (not `jest.mock`). Test env vars are set in `jest.env-setup.ts` via `setupFiles` (runs before module imports).

Test fixtures live in `src/__tests__/` as `.json` (raw ESLint output) and `.ts` (expected JS objects).
