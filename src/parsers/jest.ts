/**
 * Parser for Jest configuration (jest.config.js, jest.config.json, package.json)
 */

import type { Pattern } from '../core/types.js';
import { PatternType } from '../core/types.js';
import type { Parser } from '../plugin/types.js';
import { isGlobPattern } from '../validator/glob.js';
import { looksLikeRegex } from '../validator/regex.js';

interface JestConfig {
  testPathIgnorePatterns?: string[];
  coveragePathIgnorePatterns?: string[];
  modulePathIgnorePatterns?: string[];
  transformIgnorePatterns?: string[];
  watchPathIgnorePatterns?: string[];
  testMatch?: string[];
  testRegex?: string | string[];
  collectCoverageFrom?: string[];
  moduleNameMapper?: Record<string, string | string[]>;
  roots?: string[];
  testEnvironment?: string;
}

/** Parse jest.config.json and extract patterns */
function parseJestConfig(_filename: string, content: string): Pattern[] {
  const patterns: Pattern[] = [];

  let config: JestConfig;
  try {
    config = JSON.parse(content) as JestConfig;
  } catch {
    return patterns;
  }

  if (!config || typeof config !== 'object') {
    return patterns;
  }

  const lineMap = buildLineMap(content);

  // Path ignore patterns (usually regexes)
  const regexFields = [
    'testPathIgnorePatterns',
    'coveragePathIgnorePatterns',
    'modulePathIgnorePatterns',
    'transformIgnorePatterns',
    'watchPathIgnorePatterns'
  ] as const;

  for (const field of regexFields) {
    const values = config[field];
    if (Array.isArray(values)) {
      for (const value of values) {
        if (typeof value !== 'string') continue;
        const lineInfo = lineMap.get(value);

        // Jest uses regex strings
        patterns.push({
          value,
          type: looksLikeRegex(value) ? PatternType.REGEX : PatternType.GLOB,
          line: lineInfo?.line ?? 1,
          column: lineInfo?.column
        });
      }
    }
  }

  // Glob pattern fields
  const globFields = ['testMatch', 'collectCoverageFrom'] as const;

  for (const field of globFields) {
    const values = config[field];
    if (Array.isArray(values)) {
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
  }

  // testRegex
  if (config.testRegex) {
    const regexes = Array.isArray(config.testRegex) ? config.testRegex : [config.testRegex];
    for (const value of regexes) {
      if (typeof value !== 'string') continue;
      const lineInfo = lineMap.get(value);

      patterns.push({
        value,
        type: PatternType.REGEX,
        line: lineInfo?.line ?? 1,
        column: lineInfo?.column
      });
    }
  }

  // roots
  if (Array.isArray(config.roots)) {
    for (const value of config.roots) {
      if (typeof value !== 'string') continue;
      const lineInfo = lineMap.get(value);

      patterns.push({
        value,
        type: PatternType.PATH,
        line: lineInfo?.line ?? 1,
        column: lineInfo?.column
      });
    }
  }

  return patterns;
}

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

/** Jest config parser */
export const jestConfigParser: Parser = {
  name: 'jest',
  filePatterns: ['jest.config.json', '**/jest.config.json'],
  parse: parseJestConfig
};
