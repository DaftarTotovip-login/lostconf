/**
 * Parser for Swift linter configuration (.swiftlint.yml)
 */

import { parse as parseYaml } from 'yaml';
import type { Pattern } from '../core/types.js';
import { PatternType } from '../core/types.js';
import type { Parser } from '../plugin/types.js';
import { isGlobPattern } from '../validator/glob.js';

interface SwiftLintConfig {
  included?: string[];
  excluded?: string[];
  analyzer_rules?: unknown;
  [key: string]: unknown;
}

/** Parse .swiftlint.yml and extract patterns */
function parseSwiftLint(_filename: string, content: string): Pattern[] {
  const patterns: Pattern[] = [];

  let config: SwiftLintConfig;
  try {
    config = parseYaml(content) as SwiftLintConfig;
  } catch {
    return patterns;
  }

  if (!config || typeof config !== 'object') {
    return patterns;
  }

  const lineMap = buildLineMap(content);

  // Extract from included/excluded sections
  extractPatterns(config.included, patterns, lineMap);
  extractPatterns(config.excluded, patterns, lineMap);

  return patterns;
}

function extractPatterns(
  values: string[] | undefined,
  patterns: Pattern[],
  lineMap: Map<string, { line: number; column?: number }>
): void {
  if (!Array.isArray(values)) return;

  for (const value of values) {
    if (typeof value !== 'string') continue;

    const lineInfo = lineMap.get(value);
    const type = isGlobPattern(value) ? PatternType.GLOB : PatternType.PATH;

    patterns.push({
      value,
      type,
      line: lineInfo?.line ?? 1,
      column: lineInfo?.column
    });
  }
}

function buildLineMap(content: string): Map<string, { line: number; column?: number }> {
  const map = new Map<string, { line: number; column?: number }>();
  const lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNum = i + 1;

    const listMatch = line.match(/^\s*-\s+(?:"([^"]+)"|'([^']+)'|([^\s#]+))/);
    if (listMatch) {
      const value = listMatch[1] || listMatch[2] || listMatch[3];
      if (value && !map.has(value)) {
        map.set(value, { line: lineNum, column: line.indexOf(value) + 1 });
      }
    }
  }

  return map;
}

/** SwiftLint parser */
export const swiftlintParser: Parser = {
  name: 'swiftlint',
  filePatterns: ['.swiftlint.yml', '.swiftlint.yaml', '**/.swiftlint.yml', '**/.swiftlint.yaml'],
  parse: parseSwiftLint
};
