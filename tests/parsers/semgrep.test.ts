/**
 * Integration tests for Semgrep parsers
 */

import { describe, it, expect } from 'vitest';
import { semgrepYmlParser, semgrepIgnoreParser } from '../../src/parsers/semgrep.js';
import { PatternType } from '../../src/core/types.js';

describe('Semgrep YAML Parser', () => {
  it('should parse .semgrep.yml with paths.exclude', () => {
    const content = `rules:
  - id: test-rule
    paths:
      exclude:
        - tests/**
        - vendor
        - "*.generated.js"`;

    const patterns = semgrepYmlParser.parse('.semgrep.yml', content);

    expect(patterns.length).toBeGreaterThanOrEqual(3);
    const values = patterns.map((p) => p.value);
    expect(values).toContain('tests/**');
    expect(values).toContain('vendor');
    expect(values).toContain('*.generated.js');
  });

  it('should parse paths.include patterns', () => {
    const content = `rules:
  - id: test-rule
    paths:
      include:
        - src/**/*.js
        - lib`;

    const patterns = semgrepYmlParser.parse('.semgrep.yml', content);

    expect(patterns).toHaveLength(2);
    expect(patterns[0].value).toBe('src/**/*.js');
    expect(patterns[1].value).toBe('lib');
  });

  it('should parse multiple rules', () => {
    const content = `rules:
  - id: rule1
    paths:
      exclude:
        - tests/**
  - id: rule2
    paths:
      exclude:
        - build/**`;

    const patterns = semgrepYmlParser.parse('.semgrep.yml', content);

    expect(patterns).toHaveLength(2);
    expect(patterns[0].value).toBe('tests/**');
    expect(patterns[1].value).toBe('build/**');
  });

  it('should handle rules without paths', () => {
    const content = `rules:
  - id: rule1
    pattern: some-pattern
  - id: rule2
    paths:
      exclude:
        - vendor`;

    const patterns = semgrepYmlParser.parse('.semgrep.yml', content);

    expect(patterns).toHaveLength(1);
    expect(patterns[0].value).toBe('vendor');
  });

  it('should handle invalid YAML gracefully', () => {
    const content = 'rules: [[[invalid';
    const patterns = semgrepYmlParser.parse('.semgrep.yml', content);
    expect(patterns).toHaveLength(0);
  });
});

describe('Semgrep Ignore Parser', () => {
  it('should parse .semgrepignore file', () => {
    const content = `# Ignore test files
tests/**
*.test.js
vendor
node_modules`;

    const patterns = semgrepIgnoreParser.parse('.semgrepignore', content);

    expect(patterns).toHaveLength(4);
    expect(patterns[0].value).toBe('tests/**');
    expect(patterns[1].value).toBe('*.test.js');
    expect(patterns[2].value).toBe('vendor');
    expect(patterns[3].value).toBe('node_modules');
  });

  it('should handle negated patterns', () => {
    const content = `*.js
!important.js`;

    const patterns = semgrepIgnoreParser.parse('.semgrepignore', content);

    expect(patterns).toHaveLength(2);
    expect(patterns[0]).toMatchObject({
      value: '*.js',
      negated: false
    });
    expect(patterns[1]).toMatchObject({
      value: 'important.js',
      negated: true
    });
  });

  it('should ignore comments and empty lines', () => {
    const content = `# Comment
tests/**

# Another comment
build`;

    const patterns = semgrepIgnoreParser.parse('.semgrepignore', content);

    expect(patterns).toHaveLength(2);
    expect(patterns[0].value).toBe('tests/**');
    expect(patterns[1].value).toBe('build');
  });

  it('should detect glob patterns', () => {
    const content = `**/*.test.js
src/*.generated.ts
vendor`;

    const patterns = semgrepIgnoreParser.parse('.semgrepignore', content);

    expect(patterns[0].type).toBe(PatternType.GLOB);
    expect(patterns[1].type).toBe(PatternType.GLOB);
    expect(patterns[2].type).toBe(PatternType.PATH);
  });
});
