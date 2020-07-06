import { ChecksUpdateParamsOutputAnnotations } from '@octokit/rest';

declare namespace NodeJS {
  export interface ProcessEnv {
    GITHUB_ACTION: string;
    GITHUB_WORKSPACE: string;
  }
}

interface PrResponse {
  endCursor?: string;
  hasNextPage?: boolean;
  files: Array<string>;
}

interface ESLintMessage {
  filePath: string;
  ruleId: string;
  severity: number;
  message: string;
  line: number;
  column: number;
  nodeType: string | null;
  endLine: number;
  endColumn: number | null;
  fix: {
    range: Array<number>;
    test: string;
  };
}

interface ESLintEntry {
  filePath: string;
  messages: Array<ESLintMessage>;
  errorCount: number;
  warningCount: number;
  fixableErrorCount: number;
  fixableWarningCount: number;
  source?: string;
}

interface ReportAnalysis {
  errorCount: number;
  warningCount: number;
  markdown: string;
}

type ESLintReport = Array<ESLintEntry>;

interface AnalyzedESLintReport {
  errorCount: number;
  warningCount: number;
  success: boolean;
  markdown: string;
  summary: string;
  annotations: Array<ChecksUpdateParamsOutputAnnotations>;
}
