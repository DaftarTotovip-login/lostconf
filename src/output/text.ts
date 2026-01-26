/**
 * Text output formatter
 */

import chalk from 'chalk';
import type { ValidationResult, Finding, StaleReason } from '../core/types.js';
import type { Formatter } from './formatter.js';

/** Format reason for display */
function formatReason(reason: StaleReason): string {
  switch (reason) {
    case 'no_matches':
      return 'no matches';
    case 'file_not_found':
      return 'file not found';
    case 'invalid_pattern':
      return 'invalid pattern';
  }
}

/** Format a single finding */
function formatFinding(finding: Finding): string {
  const location = chalk.cyan(`${finding.file}:${finding.line}`);
  const pattern = chalk.yellow(finding.pattern);
  const reason = chalk.dim(formatReason(finding.reason));

  // Calculate padding for alignment
  const locationStr = `${finding.file}:${finding.line}`;
  const padding = Math.max(0, 25 - locationStr.length);

  return `${location}${' '.repeat(padding)}${pattern.padEnd(30)}${reason}`;
}

/** Text formatter */
export const textFormatter: Formatter = {
  format(result: ValidationResult): string {
    const lines: string[] = [];

    if (result.findings.length === 0) {
      lines.push(chalk.green('No stale patterns found'));
      return lines.join('\n');
    }

    // Group findings by file
    const byFile = new Map<string, Finding[]>();
    for (const finding of result.findings) {
      const existing = byFile.get(finding.file) ?? [];
      existing.push(finding);
      byFile.set(finding.file, existing);
    }

    // Output findings
    for (const [_file, findings] of byFile) {
      for (const finding of findings) {
        lines.push(formatFinding(finding));
      }
    }

    // Summary
    lines.push('');
    const totalText = result.summary.total === 1 ? 'pattern' : 'patterns';
    const filesText = result.summary.files === 1 ? 'file' : 'files';
    lines.push(
      chalk.red(
        `Found ${result.summary.total} stale ${totalText} in ${result.summary.files} ${filesText}`
      )
    );

    return lines.join('\n');
  }
};

/** Create text formatter */
export function createTextFormatter(): Formatter {
  return textFormatter;
}
