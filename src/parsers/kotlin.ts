/**
 * Parser for Kotlin linter configuration (detekt.yml)
 */

import { parse as parseYaml } from 'yaml';
import type { Pattern } from '../core/types.js';
import { PatternType } from '../core/types.js';
import type { Parser } from '../plugin/types.js';
import { isGlobPattern } from '../validator/glob.js';

interface DetektConfig {
  build?: {
    excludeCorrectable?: boolean;
    weights?: Record<string, number>;
  };
  config?: {
    validation?: boolean;
    warningsAsErrors?: boolean;
  };
  input?: {
    includes?: string[];
    excludes?: string[];
  };
  [key: string]: unknown;
}

/** Parse detekt.yml and extract patterns */
function parseDetekt(_filename: string, content: string): Pattern[] {
  const patterns: Pattern[] = [];

  let config: DetektConfig;
  try {
    config = parseYaml(content) as DetektConfig;
  } catch {
    return patterns;
  }

  if (!config || typeof config !== 'object') {
    return patterns;
  }

  const lineMap = buildLineMap(content);

  // Extract from input section
  if (config.input) {
    extractPatterns(config.input.includes, patterns, lineMap);
    extractPatterns(config.input.excludes, patterns, lineMap);
  }

  // Also look for excludes in rule configurations
  for (const [_key, value] of Object.entries(config)) {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      const ruleConfig = value as Record<string, unknown>;
      if (Array.isArray(ruleConfig.excludes)) {
        extractPatterns(ruleConfig.excludes as string[], patterns, lineMap);
      }
    }
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

    // Match quoted strings in general
    const stringMatches = line.matchAll(/["']([^"']+)["']/g);
    for (const match of stringMatches) {
      const value = match[1];
      if (value && !map.has(value)) {
        map.set(value, { line: lineNum, column: (match.index ?? 0) + 1 });
      }
    }
  }

  return map;
}

/** Detekt parser */
export const detektParser: Parser = {
  name: 'detekt',
  filePatterns: [
    'detekt.yml',
    'detekt.yaml',
    'detekt-config.yml',
    '**/detekt.yml',
    '**/detekt.yaml'
  ],
  parse: parseDetekt
};
