/**
 * Parser for Semgrep configuration files
 * Semgrep is a fast, open-source static analysis tool for finding bugs and enforcing code standards
 */

import { parse as parseYaml } from 'yaml';
import type { Pattern } from '../core/types.js';
import { PatternType } from '../core/types.js';
import type { Parser } from '../plugin/types.js';
import { isGlobPattern } from '../validator/glob.js';

type SemgrepConfig = {
  rules?: {
    paths?: {
      exclude?: string[];
      include?: string[];
    };
  }[];
  [key: string]: unknown;
};

/** Parse .semgrep.yml file */
function parseSemgrepYml(_filename: string, content: string): Pattern[] {
  const patterns: Pattern[] = [];

  let config: SemgrepConfig;
  try {
    config = parseYaml(content) as SemgrepConfig;
  } catch {
    return patterns;
  }

  const lineMap = buildLineMap(content);

  // Extract patterns from rules
  if (config.rules && Array.isArray(config.rules)) {
    for (const rule of config.rules) {
      if (!rule.paths) continue;

      const pathSections = [rule.paths.exclude, rule.paths.include];

      for (const section of pathSections) {
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
    }
  }

  return patterns;
}

/** Parse .semgrepignore file (gitignore format) */
function parseSemgrepIgnore(_filename: string, content: string): Pattern[] {
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

/** Build a map of string values to their line numbers */
function buildLineMap(content: string): Map<string, { line: number; column?: number }> {
  const map = new Map<string, { line: number; column?: number }>();
  const lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNum = i + 1;

    const quotedMatches = line.matchAll(/["']([^"']+)["']/g);
    for (const match of quotedMatches) {
      const value = match[1];
      if (value && !map.has(value)) {
        map.set(value, { line: lineNum, column: (match.index ?? 0) + 1 });
      }
    }

    const unquotedMatch = line.match(/:\s*-\s*([^\s#]+)/);
    if (unquotedMatch && unquotedMatch[1]) {
      const value = unquotedMatch[1].trim();
      if (value && !map.has(value)) {
        map.set(value, { line: lineNum, column: (unquotedMatch.index ?? 0) + 1 });
      }
    }
  }

  return map;
}

/** Semgrep YAML config parser */
export const semgrepYmlParser: Parser = {
  name: 'semgrep',
  filePatterns: ['.semgrep.yml', '.semgrep.yaml', '**/.semgrep.yml', '**/.semgrep.yaml'],
  parse: parseSemgrepYml
};

/** Semgrep ignore file parser */
export const semgrepIgnoreParser: Parser = {
  name: 'semgrepignore',
  filePatterns: ['.semgrepignore', '**/.semgrepignore'],
  parse: parseSemgrepIgnore
};
