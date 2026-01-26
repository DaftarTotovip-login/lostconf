/**
 * Parser for Markdown linter configuration (.markdownlint.json, .markdownlintignore)
 */

import type { Pattern } from '../core/types.js';
import { PatternType } from '../core/types.js';
import type { Parser } from '../plugin/types.js';
import { isGlobPattern } from '../validator/glob.js';

/** Parse .markdownlintignore file (same format as .gitignore) */
function parseMarkdownlintIgnore(_filename: string, content: string): Pattern[] {
  const patterns: Pattern[] = [];
  const lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNum = i + 1;

    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    let patternValue = trimmed;
    let negated = false;
    if (patternValue.startsWith('!')) {
      negated = true;
      patternValue = patternValue.slice(1);
    }

    const type = isGlobPattern(patternValue) ? PatternType.GLOB : PatternType.PATH;

    patterns.push({
      value: patternValue,
      type,
      line: lineNum,
      column: 1,
      negated
    });
  }

  return patterns;
}

/** Markdownlint ignore parser */
export const markdownlintIgnoreParser: Parser = {
  name: 'markdownlintignore',
  filePatterns: ['.markdownlintignore', '**/.markdownlintignore'],
  parse: parseMarkdownlintIgnore
};
