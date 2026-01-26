/**
 * Main orchestration engine
 */

import fs from 'fs/promises';
import path from 'path';
import type { Finding, ValidationResult } from './types.js';
import { discoverConfigs } from './discovery.js';
import type { DiscoveryOptions } from './discovery.js';
import { scanFileTree } from '../filetree/tree.js';
import type { FileTree } from '../filetree/tree.js';
import { validatePatterns } from '../validator/validator.js';
import type { Parser } from '../plugin/types.js';

export interface EngineOptions {
  /** Directories to scan */
  paths: string[];
  /** Glob patterns to include config files */
  include?: string[];
  /** Glob patterns to exclude config files */
  exclude?: string[];
  /** Enable verbose logging */
  verbose?: boolean;
}

export interface Engine {
  /** Run validation and return results */
  run(): Promise<ValidationResult>;
}

/** Create the validation engine */
export function createEngine(parsers: Parser[], options: EngineOptions): Engine {
  const { paths, include, exclude, verbose = false } = options;

  const log = verbose ? (msg: string) => console.error(`[lostconf] ${msg}`) : () => {};

  return {
    async run(): Promise<ValidationResult> {
      // Step 1: Discover config files
      log('Discovering config files...');
      const discoveryOptions: DiscoveryOptions = { paths, include, exclude };
      const configs = await discoverConfigs(parsers, discoveryOptions);
      log(`Found ${configs.length} config files`);

      if (configs.length === 0) {
        return {
          findings: [],
          summary: { total: 0, files: 0 }
        };
      }

      // Step 2: Build file tree
      log('Scanning file tree...');
      const basePath = paths.length === 1 ? path.resolve(paths[0]) : process.cwd();
      const tree: FileTree = await scanFileTree({ paths: [basePath] });
      log(`Found ${tree.files.size} files`);

      // Step 3: Parse and validate each config
      const allFindings: Finding[] = [];
      const filesWithFindings = new Set<string>();

      for (const config of configs) {
        log(`Processing ${config.path} with ${config.parser.name}...`);

        try {
          const content = await fs.readFile(config.absolutePath, 'utf-8');
          const patterns = config.parser.parse(config.path, content);
          log(`  Found ${patterns.length} patterns`);

          const findings = validatePatterns(config.path, patterns, config.parser.name, tree);

          if (findings.length > 0) {
            filesWithFindings.add(config.path);
            allFindings.push(...findings);
            log(`  ${findings.length} stale patterns`);
          }
        } catch (err) {
          log(`  Error: ${err instanceof Error ? err.message : String(err)}`);
        }
      }

      return {
        findings: allFindings,
        summary: {
          total: allFindings.length,
          files: filesWithFindings.size
        }
      };
    }
  };
}
