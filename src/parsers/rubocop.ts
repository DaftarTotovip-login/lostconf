/**
 * Parser for .rubocop.yml files
 */

import { parse as parseYaml } from 'yaml';
import type { Pattern } from '../core/types.js';
import { PatternType } from '../core/types.js';
import type { Parser } from '../plugin/types.js';
import { isGlobPattern } from '../validator/glob.js';
import { looksLikeRegex } from '../validator/regex.js';

interface RubocopConfig {
  AllCops?: {
    Exclude?: string[];
    Include?: string[];
  };
  [key: string]: unknown;
}

/** Parse .rubocop.yml and extract patterns */
function parseRubocop(_filename: string, content: string): Pattern[] {
  const patterns: Pattern[] = [];

  let config: RubocopConfig;
  try {
    config = parseYaml(content) as RubocopConfig;
  } catch {
    return patterns;
  }

  if (!config || typeof config !== 'object') {
    return patterns;
  }

  // Build line map for accurate line numbers
  const lineMap = buildLineMap(content);

  // Extract patterns from AllCops
  if (config.AllCops) {
    extractPatterns(config.AllCops.Exclude, patterns, lineMap);
    extractPatterns(config.AllCops.Include, patterns, lineMap);
  }

  // Extract patterns from individual cops
  for (const [key, value] of Object.entries(config)) {
    if (key === 'AllCops' || !value || typeof value !== 'object') {
      continue;
    }

    const cop = value as Record<string, unknown>;
    if (Array.isArray(cop.Exclude)) {
      extractPatterns(cop.Exclude, patterns, lineMap);
    }
    if (Array.isArray(cop.Include)) {
      extractPatterns(cop.Include, patterns, lineMap);
    }
  }

  return patterns;
}

/** Extract patterns from an array of values */
function extractPatterns(
  values: unknown[] | undefined,
  patterns: Pattern[],
  lineMap: Map<string, { line: number; column?: number }>
): void {
  if (!Array.isArray(values)) {
    return;
  }

  for (const value of values) {
    if (typeof value !== 'string') {
      continue;
    }

    // Skip special RuboCop patterns like !ruby/regexp
    if (value.startsWith('!ruby/')) {
      continue;
    }

    const lineInfo = lineMap.get(value);
    const line = lineInfo?.line ?? 1;
    const column = lineInfo?.column;

    const type = determinePatternType(value);

    patterns.push({
      value,
      type,
      line,
      column
    });
  }
}

/** Determine pattern type */
function determinePatternType(value: string): PatternType {
  if (looksLikeRegex(value)) {
    return PatternType.REGEX;
  }
  if (isGlobPattern(value)) {
    return PatternType.GLOB;
  }
  return PatternType.PATH;
}

/** Build a map of string values to their line numbers */
function buildLineMap(content: string): Map<string, { line: number; column?: number }> {
  const map = new Map<string, { line: number; column?: number }>();
  const lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNum = i + 1;

    // Match YAML list items: - value or - "value" or - 'value'
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

/** Rubocop parser */
export const rubocopParser: Parser = {
  name: 'rubocop',
  filePatterns: ['.rubocop.yml', '**/.rubocop.yml'],
  parse: parseRubocop
};
