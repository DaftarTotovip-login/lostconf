import { describe, it, expect } from 'vitest';
import { validatePattern, validatePatterns } from '../../src/validator/validator.js';
import { Pattern, PatternType } from '../../src/core/types.js';
import { FileTree } from '../../src/filetree/scanner.js';

describe('validatePattern', () => {
  const mockTree: FileTree = {
    files: new Set([
      'src/index.ts',
      'src/utils/helpers.ts',
      'tests/index.test.ts',
      'package.json',
      'README.md'
    ]),
    directories: new Set(['src', 'src/utils', 'tests']),
    basePath: '/project'
  };

  describe('path patterns', () => {
    it('should validate existing file path', () => {
      const pattern: Pattern = {
        value: 'src/index.ts',
        type: PatternType.PATH,
        line: 1
      };

      const result = validatePattern(pattern, mockTree);
      expect(result.valid).toBe(true);
    });

    it('should validate existing directory path', () => {
      const pattern: Pattern = {
        value: 'src/utils',
        type: PatternType.PATH,
        line: 1
      };

      const result = validatePattern(pattern, mockTree);
      expect(result.valid).toBe(true);
    });

    it('should invalidate non-existent path', () => {
      const pattern: Pattern = {
        value: 'src/missing.ts',
        type: PatternType.PATH,
        line: 1
      };

      const result = validatePattern(pattern, mockTree);
      expect(result.valid).toBe(false);
      expect(result.reason).toBe('file_not_found');
    });
  });

  describe('glob patterns', () => {
    it('should validate matching glob pattern', () => {
      const pattern: Pattern = {
        value: 'src/**/*.ts',
        type: PatternType.GLOB,
        line: 1
      };

      const result = validatePattern(pattern, mockTree);
      expect(result.valid).toBe(true);
    });

    it('should validate matching wildcard pattern', () => {
      const pattern: Pattern = {
        value: '*.md',
        type: PatternType.GLOB,
        line: 1
      };

      const result = validatePattern(pattern, mockTree);
      expect(result.valid).toBe(true);
    });

    it('should invalidate non-matching glob pattern', () => {
      const pattern: Pattern = {
        value: 'lib/**/*.js',
        type: PatternType.GLOB,
        line: 1
      };

      const result = validatePattern(pattern, mockTree);
      expect(result.valid).toBe(false);
      expect(result.reason).toBe('no_matches');
    });
  });

  describe('negated patterns', () => {
    it('should skip validation for negated patterns', () => {
      const pattern: Pattern = {
        value: 'important.log',
        type: PatternType.PATH,
        line: 1,
        negated: true
      };

      const result = validatePattern(pattern, mockTree);
      expect(result.valid).toBe(true);
    });
  });
});

describe('validatePatterns', () => {
  const mockTree: FileTree = {
    files: new Set(['src/index.ts', 'README.md']),
    directories: new Set(['src']),
    basePath: '/project'
  };

  it('should return findings for stale patterns', () => {
    const patterns: Pattern[] = [
      { value: 'src/index.ts', type: PatternType.PATH, line: 1 },
      { value: 'missing.ts', type: PatternType.PATH, line: 2 },
      { value: 'lib/**/*.js', type: PatternType.GLOB, line: 3 }
    ];

    const findings = validatePatterns('.gitignore', patterns, 'gitignore', mockTree);

    expect(findings).toHaveLength(2);
    expect(findings[0].pattern).toBe('missing.ts');
    expect(findings[0].reason).toBe('file_not_found');
    expect(findings[1].pattern).toBe('lib/**/*.js');
    expect(findings[1].reason).toBe('no_matches');
  });

  it('should include parser name in findings', () => {
    const patterns: Pattern[] = [{ value: 'nonexistent', type: PatternType.PATH, line: 1 }];

    const findings = validatePatterns('.eslintignore', patterns, 'eslintignore', mockTree);

    expect(findings[0].parser).toBe('eslintignore');
  });
});
