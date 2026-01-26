/**
 * Parser for Deno configuration files
 * Deno is a modern runtime for JavaScript and TypeScript
 */

import type { Pattern } from '../core/types.js';
import { PatternType } from '../core/types.js';
import type { Parser } from '../plugin/types.js';
import { isGlobPattern } from '../validator/glob.js';

type DenoConfig = {
  exclude?: string[];
  lint?: {
    exclude?: string[];
    include?: string[];
  };
  fmt?: {
    exclude?: string[];
    include?: string[];
  };
  test?: {
    exclude?: string[];
    include?: string[];
  };
  [key: string]: unknown;
};

/** Parse deno.json/deno.jsonc file */
function parseDeno(_filename: string, content: string): Pattern[] {
  const patterns: Pattern[] = [];

  let config: DenoConfig;
  try {
    // Strip JSONC comments (simple approach - handles // and /* */ comments)
    const cleanContent = content.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*/g, '');
    config = JSON.parse(cleanContent);
  } catch {
    return patterns;
  }

  const lineMap = buildLineMap(content);

  // Extract patterns from various sections
  const sections = [
    config.exclude,
    config.lint?.exclude,
    config.lint?.include,
    config.fmt?.exclude,
    config.fmt?.include,
    config.test?.exclude,
    config.test?.include
  ];

  for (const section of sections) {
    if (!section || !Array.isArray(section)) continue;

    for (const pattern of section) {
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

/** Deno configuration parser */
export const denoParser: Parser = {
  name: 'deno',
  filePatterns: ['deno.json', 'deno.jsonc', '**/deno.json', '**/deno.jsonc'],
  parse: parseDeno
};
