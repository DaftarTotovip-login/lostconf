/**
 * lostconf - A meta-linter that detects stale references in configuration files
 */

// Core types
export {
  PatternType,
  Pattern,
  Finding,
  StaleReason,
  Summary,
  ValidationResult,
  CliOptions
} from './core/types.js';

// Engine
export { createEngine, Engine, EngineOptions } from './core/engine.js';

// Plugin system
export { Parser, ParserFactory } from './plugin/types.js';
export { PluginRegistry, registry } from './plugin/registry.js';

// Parsers
export {
  getBuiltinParsers,
  gitignoreParser,
  dockerignoreParser,
  eslintIgnoreParser,
  prettierIgnoreParser,
  pyprojectParser,
  rubocopParser,
  createIgnoreParser
} from './parsers/index.js';

// Formatters
export { Formatter, FormatterFactory } from './output/formatter.js';
export { createTextFormatter, textFormatter } from './output/text.js';
export { createJsonFormatter, jsonFormatter } from './output/json.js';
export { createSarifFormatter, sarifFormatter } from './output/sarif.js';

// File tree
export { scanFileTree, pathExists, FileTree, ScanOptions } from './filetree/scanner.js';

// Validator
export { validatePattern, validatePatterns, ValidatorOptions } from './validator/validator.js';
