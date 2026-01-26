/**
 * Plugin registry for managing parsers
 */

import type { Parser } from './types.js';

export class PluginRegistry {
  private parsers = new Map<string, Parser>();

  /** Register a parser */
  register(parser: Parser): void {
    if (this.parsers.has(parser.name)) {
      throw new Error(`Parser "${parser.name}" is already registered`);
    }
    this.parsers.set(parser.name, parser);
  }

  /** Get all registered parsers */
  getParsers(): Parser[] {
    return Array.from(this.parsers.values());
  }

  /** Get a parser by name */
  getParser(name: string): Parser | undefined {
    return this.parsers.get(name);
  }

  /** Get parsers that can handle a given filename */
  getParsersForFile(filename: string, allFiles: string[]): Parser[] {
    const result: Parser[] = [];
    for (const parser of this.parsers.values()) {
      for (const pattern of parser.filePatterns) {
        // Simple pattern matching for now
        // Check if filename matches the pattern
        if (this.matchesPattern(filename, pattern, allFiles)) {
          result.push(parser);
          break;
        }
      }
    }
    return result;
  }

  /** Check if a filename matches a pattern */
  private matchesPattern(filename: string, pattern: string, _allFiles: string[]): boolean {
    // Handle exact match
    if (filename === pattern || filename.endsWith('/' + pattern)) {
      return true;
    }
    // Handle **/pattern for any directory
    if (pattern.startsWith('**/')) {
      const suffix = pattern.slice(3);
      return filename === suffix || filename.endsWith('/' + suffix);
    }
    return false;
  }
}

/** Global registry instance */
export const registry = new PluginRegistry();
