/**
 * Integration tests for Pyright parser
 */

import { describe, it, expect } from 'vitest';
import { pyrightParser } from '../../src/parsers/pyright.js';
import { PatternType } from '../../src/core/types.js';

describe('Pyright Parser', () => {
  it('should parse pyrightconfig.json with exclude', () => {
    const content = `{
  "exclude": [
    "node_modules",
    "**/__pycache__",
    "build"
  ]
}`;

    const patterns = pyrightParser.parse('pyrightconfig.json', content);

    expect(patterns).toHaveLength(3);
    expect(patterns[0].value).toBe('node_modules');
    expect(patterns[1]).toMatchObject({
      value: '**/__pycache__',
      type: PatternType.GLOB
    });
    expect(patterns[2].value).toBe('build');
  });

  it('should parse include patterns', () => {
    const content = `{
  "include": [
    "src",
    "lib/**/*.py"
  ]
}`;

    const patterns = pyrightParser.parse('pyrightconfig.json', content);

    expect(patterns).toHaveLength(2);
    expect(patterns[0].value).toBe('src');
    expect(patterns[1].value).toBe('lib/**/*.py');
  });

  it('should parse ignore patterns', () => {
    const content = `{
  "ignore": [
    "tests/fixtures",
    "*.generated.py"
  ]
}`;

    const patterns = pyrightParser.parse('pyrightconfig.json', content);

    expect(patterns).toHaveLength(2);
    expect(patterns[0].value).toBe('tests/fixtures');
    expect(patterns[1].value).toBe('*.generated.py');
  });

  it('should parse extraPaths', () => {
    const content = `{
  "extraPaths": [
    "src",
    "lib"
  ]
}`;

    const patterns = pyrightParser.parse('pyrightconfig.json', content);

    expect(patterns).toHaveLength(2);
    expect(patterns[0].value).toBe('src');
    expect(patterns[1].value).toBe('lib');
  });

  it('should parse all fields combined', () => {
    const content = `{
  "include": ["src"],
  "exclude": ["build", "dist"],
  "ignore": ["*.test.py"],
  "extraPaths": ["lib"]
}`;

    const patterns = pyrightParser.parse('pyrightconfig.json', content);

    expect(patterns).toHaveLength(5);
    const values = patterns.map((p) => p.value);
    expect(values).toContain('src');
    expect(values).toContain('build');
    expect(values).toContain('dist');
    expect(values).toContain('*.test.py');
    expect(values).toContain('lib');
  });

  it('should handle full config with other options', () => {
    const content = `{
  "typeCheckingMode": "strict",
  "exclude": ["node_modules", "build"],
  "reportMissingImports": true,
  "pythonVersion": "3.9"
}`;

    const patterns = pyrightParser.parse('pyrightconfig.json', content);

    expect(patterns).toHaveLength(2);
    expect(patterns[0].value).toBe('node_modules');
    expect(patterns[1].value).toBe('build');
  });

  it('should handle empty arrays', () => {
    const content = `{
  "exclude": [],
  "include": []
}`;

    const patterns = pyrightParser.parse('pyrightconfig.json', content);
    expect(patterns).toHaveLength(0);
  });

  it('should handle invalid JSON gracefully', () => {
    const content = '{ invalid json }';
    const patterns = pyrightParser.parse('pyrightconfig.json', content);
    expect(patterns).toHaveLength(0);
  });

  it('should detect glob patterns', () => {
    const content = `{
  "exclude": [
    "tests/**",
    "*.pyc",
    "build"
  ]
}`;

    const patterns = pyrightParser.parse('pyrightconfig.json', content);

    expect(patterns[0].type).toBe(PatternType.GLOB);
    expect(patterns[1].type).toBe(PatternType.GLOB);
    expect(patterns[2].type).toBe(PatternType.PATH);
  });
});
