/**
 * File tree scanner using fast-glob
 */

import fg from 'fast-glob';
import path from 'path';

export interface ScanOptions {
  /** Directories to scan */
  paths: string[];
  /** Glob patterns to exclude */
  ignore?: string[];
  /** Follow symlinks */
  followSymlinks?: boolean;
}

export interface FileTree {
  /** All files in the tree (relative paths) */
  files: Set<string>;
  /** All directories in the tree (relative paths) */
  directories: Set<string>;
  /** Base path for the tree */
  basePath: string;
}

/** Default ignore patterns */
const DEFAULT_IGNORE = [
  '**/node_modules/**',
  '**/.git/**',
  '**/dist/**',
  '**/build/**',
  '**/.next/**',
  '**/coverage/**',
  '**/__pycache__/**',
  '**/.venv/**',
  '**/venv/**',
  '**/.tox/**',
  '**/vendor/**'
];

/** Scan a directory and build a file tree */
export async function scanFileTree(options: ScanOptions): Promise<FileTree> {
  const { paths, ignore = [], followSymlinks = false } = options;
  const basePath = paths.length === 1 ? path.resolve(paths[0]) : process.cwd();

  const allIgnore = [...DEFAULT_IGNORE, ...ignore];

  // Scan for all files
  const files = await fg('**/*', {
    cwd: basePath,
    dot: true,
    onlyFiles: true,
    ignore: allIgnore,
    followSymbolicLinks: followSymlinks
  });

  // Build directory set from file paths
  const directories = new Set<string>();
  for (const file of files) {
    const dir = path.dirname(file);
    if (dir !== '.') {
      // Add all parent directories
      const parts = dir.split('/');
      let current = '';
      for (const part of parts) {
        current = current ? `${current}/${part}` : part;
        directories.add(current);
      }
    }
  }

  return {
    files: new Set(files),
    directories,
    basePath
  };
}

/** Check if a path exists in the file tree */
export function pathExists(tree: FileTree, targetPath: string): boolean {
  const normalized = targetPath.replace(/\\/g, '/').replace(/^\.\//, '');
  return tree.files.has(normalized) || tree.directories.has(normalized);
}

/** Get all files matching a glob pattern */
export function matchGlob(tree: FileTree, pattern: string): string[] {
  // This is handled by the validator using micromatch
  // This function is just for direct lookups
  const normalized = pattern.replace(/\\/g, '/').replace(/^\.\//, '');
  const matches: string[] = [];

  for (const file of tree.files) {
    if (file === normalized || file.startsWith(normalized + '/')) {
      matches.push(file);
    }
  }

  return matches;
}
