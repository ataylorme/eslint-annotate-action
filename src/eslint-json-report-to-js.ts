import fs from 'fs';
import path from 'path';

import * as core from '@actions/core';

import { ESLintReport } from './types';

export default function ESLintJsonReportToJS(): ESLintReport {
  const report = core.getInput('report-json', { required: false }) || 'eslint_report.json';
  const reportPath = path.resolve(report);
  if (!fs.existsSync(reportPath)) {
    core.setFailed(`The report-json file "${report}" could not be resolved.`);
  }
  const reportContents = fs.readFileSync(reportPath, 'utf-8');
  return JSON.parse(reportContents) as ESLintReport;
}
