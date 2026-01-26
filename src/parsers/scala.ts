/**
 * Parser for Scala configuration files (.scalafmt.conf, .scalafix.conf)
 */

import type { Pattern } from '../core/types.js';
import { PatternType } from '../core/types.js';
import type { Parser } from '../plugin/types.js';
import { isGlobPattern } from '../validator/glob.js';
import { looksLikeRegex } from '../validator/regex.js';

/** Parse .scalafmt.conf (HOCON format - simplified parsing) */
function parseScalafmtConfig(_filename: string, content: string): Pattern[] {
  const patterns: Pattern[] = [];
  const lines = content.split('\n');

  // Look for project.excludeFilters, project.includeFilters, etc.
  let inFiltersSection = false;
  let bracketDepth = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNum = i + 1;
    const trimmed = line.trim();

    // Check for filter section start
    if (/(?:excludeFilters|includeFilters|excludePaths)\s*[=:]/.test(trimmed)) {
      inFiltersSection = true;
      bracketDepth = 0;
    }

    // Track bracket depth
    bracketDepth += (trimmed.match(/\[/g) || []).length;
    bracketDepth -= (trimmed.match(/\]/g) || []).length;

    if (inFiltersSection) {
      // End of section
      if (bracketDepth <= 0 && !trimmed.includes('[')) {
        inFiltersSection = false;
        continue;
      }

      // Extract quoted strings (patterns)
      const stringMatches = line.matchAll(/"([^"]+)"/g);
      for (const match of stringMatches) {
        const value = match[1];
        if (!value) continue;

        // Determine type
        let type: PatternType;
        if (looksLikeRegex(value)) {
          type = PatternType.REGEX;
        } else if (isGlobPattern(value)) {
          type = PatternType.GLOB;
        } else {
          type = PatternType.PATH;
        }

        patterns.push({
          value,
          type,
          line: lineNum,
          column: (match.index ?? 0) + 1
        });
      }
    }
  }

  return patterns;
}

/** Scalafmt parser */
export const scalafmtParser: Parser = {
  name: 'scalafmt',
  filePatterns: ['.scalafmt.conf', '**/.scalafmt.conf'],
  parse: parseScalafmtConfig
};

/** Scalafix parser */
export const scalafixParser: Parser = {
  name: 'scalafix',
  filePatterns: ['.scalafix.conf', '**/.scalafix.conf'],
  parse: parseScalafmtConfig
};
