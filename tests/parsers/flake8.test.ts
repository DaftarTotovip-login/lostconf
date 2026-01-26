/**
 * Integration tests for Flake8 parser
 */

import { describe, it, expect } from 'vitest';
import { flake8Parser, flake8SetupCfgParser } from '../../src/parsers/flake8.js';
import { PatternType } from '../../src/core/types.js';

describe('Flake8 Parser', () => {
  it('should parse .flake8 with exclude patterns', () => {
    const content = `[flake8]
exclude =
    .git,
    __pycache__,
    build,
    dist/**
max-line-length = 88`;

    const patterns = flake8Parser.parse('.flake8', content);

    expect(patterns).toHaveLength(4);
    expect(patterns[0]).toMatchObject({
      value: '.git',
      type: PatternType.PATH
    });
    expect(patterns[1]).toMatchObject({
      value: '__pycache__',
      type: PatternType.PATH
    });
    expect(patterns[2]).toMatchObject({
      value: 'build',
      type: PatternType.PATH
    });
    expect(patterns[3]).toMatchObject({
      value: 'dist/**',
      type: PatternType.GLOB
    });
  });

  it('should parse extend-exclude', () => {
    const content = `[flake8]
extend-exclude =
    migrations,
    *.pyc,
    tests/fixtures/**`;

    const patterns = flake8Parser.parse('.flake8', content);

    expect(patterns).toHaveLength(3);
    expect(patterns[0].value).toBe('migrations');
    expect(patterns[1].value).toBe('*.pyc');
    expect(patterns[2].value).toBe('tests/fixtures/**');
  });

  it('should parse per-file-ignores', () => {
    const content = `[flake8]
per-file-ignores =
    __init__.py:F401
    tests/*.py:S101,S102
    legacy/old.py:E501`;

    const patterns = flake8Parser.parse('.flake8', content);

    // Each line is parsed separately
    expect(patterns.length).toBeGreaterThanOrEqual(3);
    const values = patterns.map((p) => p.value);
    expect(values).toContain('__init__.py');
    expect(values).toContain('tests/*.py');
    expect(values).toContain('legacy/old.py');
  });

  it('should parse filename patterns', () => {
    const content = `[flake8]
filename = *.py,*.pyi`;

    const patterns = flake8Parser.parse('.flake8', content);

    expect(patterns).toHaveLength(2);
    expect(patterns[0].value).toBe('*.py');
    expect(patterns[1].value).toBe('*.pyi');
  });

  it('should ignore non-flake8 sections', () => {
    const content = `[other]
exclude = should_not_parse

[flake8]
exclude = should_parse

[another]
exclude = also_should_not_parse`;

    const patterns = flake8Parser.parse('.flake8', content);

    expect(patterns).toHaveLength(1);
    expect(patterns[0].value).toBe('should_parse');
  });

  it('should handle comments', () => {
    const content = `[flake8]
# This is a comment
exclude = build
; This is also a comment
extend-exclude = dist`;

    const patterns = flake8Parser.parse('.flake8', content);

    expect(patterns).toHaveLength(2);
    expect(patterns[0].value).toBe('build');
    expect(patterns[1].value).toBe('dist');
  });

  it('should parse setup.cfg [flake8] section', () => {
    const content = `[metadata]
name = myproject

[flake8]
exclude = .git,__pycache__

[options]
packages = find:`;

    const patterns = flake8SetupCfgParser.parse('setup.cfg', content);

    expect(patterns).toHaveLength(2);
    expect(patterns[0].value).toBe('.git');
    expect(patterns[1].value).toBe('__pycache__');
  });

  it('should handle empty flake8 section', () => {
    const content = `[flake8]
max-line-length = 88`;

    const patterns = flake8Parser.parse('.flake8', content);
    expect(patterns).toHaveLength(0);
  });
});
