/**
 * Parser for TypeScript configuration (tsconfig.json)
 */

import type { Pattern } from '../core/types.js';
import { PatternType } from '../core/types.js';
import type { Parser } from '../plugin/types.js';
import { isGlobPattern } from '../validator/glob.js';

/** Common exclude patterns that are typically proactive (don't need validation) */
const COMMON_EXCLUDES = new Set([
  'node_modules',
  'dist',
  'build',
  'out',
  'coverage',
  '.git',
  '.next',
  '.nuxt',
  '.output',
  'bower_components'
]);

interface TsConfig {
  include?: string[];
  exclude?: string[];
  files?: string[];
  compilerOptions?: {
    rootDir?: string;
    outDir?: string;
    baseUrl?: string;
    paths?: Record<string, string[]>;
    typeRoots?: string[];
    types?: string[];
  };
  extends?: string;
  references?: { path: string }[];
}

/** Parse tsconfig.json and extract patterns */
function parseTsConfig(_filename: string, content: string): Pattern[] {
  const patterns: Pattern[] = [];

  let config: TsConfig;
  try {
    config = JSON.parse(content) as TsConfig;
  } catch {
    return patterns;
  }

  if (!config || typeof config !== 'object') {
    return patterns;
  }

  const lineMap = buildLineMap(content);

  // Extract include patterns
  if (Array.isArray(config.include)) {
    for (const value of config.include) {
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

  // Extract exclude patterns (skip common proactive excludes)
  if (Array.isArray(config.exclude)) {
    for (const value of config.exclude) {
      if (typeof value !== 'string') continue;
      // Skip common proactive excludes
      if (COMMON_EXCLUDES.has(value)) continue;
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

  // Extract files
  if (Array.isArray(config.files)) {
    for (const value of config.files) {
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

  // Extract typeRoots
  if (config.compilerOptions?.typeRoots) {
    for (const value of config.compilerOptions.typeRoots) {
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

  // Extract references
  if (Array.isArray(config.references)) {
    for (const ref of config.references) {
      if (typeof ref?.path === 'string') {
        const lineInfo = lineMap.get(ref.path);

        patterns.push({
          value: ref.path,
          type: PatternType.PATH,
          line: lineInfo?.line ?? 1,
          column: lineInfo?.column
        });
      }
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

/** TSConfig parser */
export const tsconfigParser: Parser = {
  name: 'tsconfig',
  filePatterns: [
    'tsconfig.json',
    'tsconfig.*.json',
    'jsconfig.json',
    '**/tsconfig.json',
    '**/jsconfig.json'
  ],
  parse: parseTsConfig
};
