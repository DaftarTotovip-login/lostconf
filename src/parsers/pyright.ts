/**
 * Parser for Pyright configuration files
 * Pyright is a fast type checker for Python
 */

import type { Pattern } from '../core/types.js';
import { PatternType } from '../core/types.js';
import type { Parser } from '../plugin/types.js';
import { isGlobPattern } from '../validator/glob.js';

type PyrightConfig = {
  include?: string[];
  exclude?: string[];
  ignore?: string[];
  extraPaths?: string[];
  typeCheckingMode?: string;
  [key: string]: unknown;
};

/** Parse pyrightconfig.json file */
function parsePyright(_filename: string, content: string): Pattern[] {
  const patterns: Pattern[] = [];

  let config: PyrightConfig;
  try {
    config = JSON.parse(content);
  } catch {
    return patterns;
  }

  const lineMap = buildLineMap(content);

  // Extract patterns from various fields
  const fields = [config.include, config.exclude, config.ignore, config.extraPaths];

  for (const field of fields) {
    if (!field || !Array.isArray(field)) continue;

    for (const pattern of field) {
      if (typeof pattern !== 'string') continue;

      const lineInfo = lineMap.get(pattern);
      const line = lineInfo?.line ?? 1;
      const column = lineInfo?.column;

      const type = isGlobPattern(pattern) ? PatternType.GLOB : PatternType.PATH;

      patterns.push({
        value: pattern,
        type,
        line,
        column
      });
    }
  }

  return patterns;
}

/** Build a map of string values to their line numbers */
function buildLineMap(content: string): Map<string, { line: number; column?: number }> {
  const map = new Map<string, { line: number; column?: number }>();
  const lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNum = i + 1;

    const stringMatches = line.matchAll(/"([^"]+)"/g);
    for (const match of stringMatches) {
      const value = match[1];
      if (value && !map.has(value)) {
        map.set(value, { line: lineNum, column: (match.index ?? 0) + 1 });
      }
    }
  }

  return map;
}

/** Pyright configuration parser */
export const pyrightParser: Parser = {
  name: 'pyright',
  filePatterns: ['pyrightconfig.json', '**/pyrightconfig.json'],
  parse: parsePyright
};
