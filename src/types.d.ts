declare namespace NodeJS {
  export interface ProcessEnv {
    GITHUB_ACTION: string;
    GITHUB_WORKSPACE: string;
  }
}

interface PrResponse {
  endCursor?: string;
  hasNextPage?: boolean;
  files: string[];
}

interface ESLintMessage {
  ruleId: string;
  severity: number;
  message: string;
  line: number;
  column: number;
  nodeType: string | null;
  endLine: number;
  endColumn: number;
  fix: object;
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
