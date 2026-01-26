/**
 * Integration tests for yamllint parser
 */

import { describe, it, expect } from 'vitest';
import { yamllintParser } from '../../src/parsers/yamllint.js';
import { PatternType } from '../../src/core/types.js';

describe('yamllint Parser', () => {
  it('should parse .yamllint with ignore as array', () => {
    const content = `ignore:
  - /build/
  - /dist/
  - '*.min.yaml'`;

    const patterns = yamllintParser.parse('.yamllint', content);

    expect(patterns).toHaveLength(3);
    expect(patterns[0].value).toBe('/build/');
    expect(patterns[1].value).toBe('/dist/');
    expect(patterns[2]).toMatchObject({
      value: '*.min.yaml',
      type: PatternType.GLOB
    });
  });

  it('should parse ignore as string', () => {
    const content = `ignore: /build/`;

    const patterns = yamllintParser.parse('.yamllint', content);

    expect(patterns).toHaveLength(1);
    expect(patterns[0]).toMatchObject({
      value: '/build/',
      type: PatternType.PATH,
      line: 1
    });
  });

  it('should parse ignore-from-file', () => {
    const content = `ignore-from-file: .yamlignore`;

    const patterns = yamllintParser.parse('.yamllint', content);

    expect(patterns).toHaveLength(1);
    expect(patterns[0]).toMatchObject({
      value: '.yamlignore',
      type: PatternType.PATH,
      line: 1
    });
  });

  it('should parse both ignore and ignore-from-file', () => {
    const content = `ignore:
  - build/**
  - dist
ignore-from-file: .yamlignore`;

    const patterns = yamllintParser.parse('.yamllint', content);

    expect(patterns).toHaveLength(3);
    expect(patterns[0].value).toBe('build/**');
    expect(patterns[1].value).toBe('dist');
    expect(patterns[2].value).toBe('.yamlignore');
  });

  it('should parse glob patterns', () => {
    const content = `ignore:
  - '**/*.generated.yaml'
  - 'tests/**/*.yaml'
  - '*.tmp.yml'`;

    const patterns = yamllintParser.parse('.yamllint', content);

    expect(patterns).toHaveLength(3);
    expect(patterns[0]).toMatchObject({
      value: '**/*.generated.yaml',
      type: PatternType.GLOB
    });
    expect(patterns[1]).toMatchObject({
      value: 'tests/**/*.yaml',
      type: PatternType.GLOB
    });
    expect(patterns[2]).toMatchObject({
      value: '*.tmp.yml',
      type: PatternType.GLOB
    });
  });

  it('should handle full config with rules', () => {
    const content = `extends: default
ignore:
  - /build/
  - /dist/
rules:
  line-length:
    max: 120
  indentation:
    spaces: 2`;

    const patterns = yamllintParser.parse('.yamllint.yml', content);

    expect(patterns).toHaveLength(2);
    expect(patterns[0].value).toBe('/build/');
    expect(patterns[1].value).toBe('/dist/');
  });

  it('should handle empty ignore', () => {
    const content = `ignore: []
rules:
  line-length: 80`;

    const patterns = yamllintParser.parse('.yamllint', content);
    expect(patterns).toHaveLength(0);
  });

  it('should handle invalid YAML gracefully', () => {
    const content = 'not: valid: yaml: [[[';
    const patterns = yamllintParser.parse('.yamllint', content);
    expect(patterns).toHaveLength(0);
  });

  it('should handle quotes in paths', () => {
    const content = `ignore:
  - "/path/with spaces/"
  - '/another/path/'
  - mixed-no-quotes`;

    const patterns = yamllintParser.parse('.yamllint', content);

    expect(patterns).toHaveLength(3);
    expect(patterns[0].value).toBe('/path/with spaces/');
    expect(patterns[1].value).toBe('/another/path/');
    expect(patterns[2].value).toBe('mixed-no-quotes');
  });
});
