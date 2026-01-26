/**
 * Parser for .golangci.yml (Go linter configuration)
 */

import { parse as parseYaml } from 'yaml';
import type { Pattern } from '../core/types.js';
import { PatternType } from '../core/types.js';
import type { Parser } from '../plugin/types.js';
import { isGlobPattern } from '../validator/glob.js';

interface GolangciConfig {
  run?: {
    skip?: string[];
    'skip-dirs'?: string[];
    'skip-dirs-use-default'?: boolean;
    'skip-files'?: string[];
  };
  issues?: {
    'exclude-dirs'?: string[];
    'exclude-files'?: string[];
  };
  linters?: {
    exclude?: string[];
  };
  [key: string]: unknown;
}

/** Parse .golangci.yml and extract patterns */
function parseGolangci(_filename: string, content: string): Pattern[] {
  const patterns: Pattern[] = [];

  let config: GolangciConfig;
  try {
    config = parseYaml(content) as GolangciConfig;
  } catch {
    return patterns;
  }

  if (!config || typeof config !== 'object') {
    return patterns;
  }

  const lineMap = buildLineMap(content);

  // Extract from run section
  if (config.run) {
    extractPatterns(config.run.skip, patterns, lineMap);
    extractPatterns(config.run['skip-dirs'], patterns, lineMap);
    extractPatterns(config.run['skip-files'], patterns, lineMap);
  }

  // Extract from issues section
  if (config.issues) {
    extractPatterns(config.issues['exclude-dirs'], patterns, lineMap);
    extractPatterns(config.issues['exclude-files'], patterns, lineMap);
  }

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

    // Match YAML list items or quoted strings
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

/** GolangCI-Lint parser */
export const golangciParser: Parser = {
  name: 'golangci',
  filePatterns: ['.golangci.yml', '.golangci.yaml', '**/.golangci.yml', '**/.golangci.yaml'],
  parse: parseGolangci
};
