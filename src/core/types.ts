/**
 * Core type definitions for lostconf
 */

/** Pattern types that can be extracted from config files */
export enum PatternType {
  PATH = 'path',
  GLOB = 'glob',
  REGEX = 'regex'
}

/** Reasons why a pattern is considered stale */
export type StaleReason = 'no_matches' | 'file_not_found' | 'invalid_pattern';

/** A pattern extracted from a config file */
export interface Pattern {
  /** The raw pattern value */
  value: string;
  /** Type of pattern */
  type: PatternType;
  /** Line number in the config file (1-indexed) */
  line: number;
  /** Column number (optional, 1-indexed) */
  column?: number;
  /** Whether this is a negated pattern (e.g., !pattern) */
  negated?: boolean;
  /** Base path for relative patterns */
  basePath?: string;
}

/** A finding representing a stale pattern */
export interface Finding {
  /** Config file containing the stale pattern */
  file: string;
  /** Line number (1-indexed) */
  line: number;
  /** Column number (optional, 1-indexed) */
  column?: number;
  /** The stale pattern */
  pattern: string;
  /** Type of pattern */
  type: PatternType;
  /** Why the pattern is stale */
  reason: StaleReason;
  /** Name of the parser that found this */
  parser: string;
}

/** Summary of validation results */
export interface Summary {
  /** Total number of stale patterns found */
  total: number;
  /** Number of config files with stale patterns */
  files: number;
}

/** Complete validation result */
export interface ValidationResult {
  findings: Finding[];
  summary: Summary;
}

/** CLI options */
export interface CliOptions {
  format: 'text' | 'json' | 'sarif';
  output?: string;
  include?: string[];
  exclude?: string[];
  failOnStale: boolean;
  quiet: boolean;
  verbose: boolean;
}
