import { type Endpoints } from '@octokit/types';

type CheckRunParameters = Endpoints['POST /repos/{owner}/{repo}/check-runs']['parameters'];
export type AnnotationProperties = Required<Required<CheckRunParameters>['output']>['annotations'][0];

declare namespace NodeJS {
  export interface ProcessEnv {
    GITHUB_ACTION: string;
    GITHUB_WORKSPACE: string;
  }
}

interface ESLintMessage {
  filePath: string;
  ruleId: string;
  severity: number;
  message: string;
  line: number;
  column: number | null;
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
  annotations: Array<AnnotationProperties>;
}
