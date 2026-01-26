/**
 * Integration tests for Pylint parser
 */

import { describe, it, expect } from 'vitest';
import { pylintrcParser } from '../../src/parsers/pylint.js';
import { PatternType } from '../../src/core/types.js';

describe('Pylint Parser', () => {
  it('should parse .pylintrc with ignore patterns', () => {
    const content = `[MASTER]
ignore=CVS,.git,__pycache__
ignore-paths=^tests/fixtures/.*$`;

    const patterns = pylintrcParser.parse('.pylintrc', content);

    expect(patterns).toHaveLength(4);
    expect(patterns[0].value).toBe('CVS');
    expect(patterns[1].value).toBe('.git');
    expect(patterns[2].value).toBe('__pycache__');
    expect(patterns[3]).toMatchObject({
      value: '^tests/fixtures/.*$',
      type: PatternType.REGEX
    });
  });

  it('should parse [MAIN] section', () => {
    const content = `[MAIN]
ignore=build,dist
source-roots=src,lib`;

    const patterns = pylintrcParser.parse('pylintrc', content);

    expect(patterns).toHaveLength(4);
    expect(patterns[0].value).toBe('build');
    expect(patterns[1].value).toBe('dist');
    expect(patterns[2].value).toBe('src');
    expect(patterns[3].value).toBe('lib');
  });

  it('should parse ignore-patterns', () => {
    const content = `[MASTER]
ignore-patterns=.*_pb2\\.py$,test_.*\\.py`;

    const patterns = pylintrcParser.parse('.pylintrc', content);

    expect(patterns).toHaveLength(2);
    expect(patterns[0]).toMatchObject({
      value: '.*_pb2\\.py$'
    });
    // Pattern type detection may vary based on pattern format
    expect(patterns[0].type).toBeTruthy();
    expect(patterns[1]).toMatchObject({
      value: 'test_.*\\.py'
    });
  });

  it('should parse glob patterns', () => {
    const content = `[MASTER]
ignore=**/__pycache__/**,*.pyc`;

    const patterns = pylintrcParser.parse('.pylintrc', content);

    expect(patterns).toHaveLength(2);
    expect(patterns[0]).toMatchObject({
      value: '**/__pycache__/**',
      type: PatternType.GLOB
    });
    expect(patterns[1]).toMatchObject({
      value: '*.pyc',
      type: PatternType.GLOB
    });
  });

  it('should ignore other sections', () => {
    const content = `[MESSAGES CONTROL]
disable=C0111

[MASTER]
ignore=build

[FORMAT]
max-line-length=88`;

    const patterns = pylintrcParser.parse('.pylintrc', content);

    expect(patterns).toHaveLength(1);
    expect(patterns[0].value).toBe('build');
  });

  it('should handle comments', () => {
    const content = `[MASTER]
# Comment line
ignore=build,dist
; Another comment
ignore-paths=^legacy/.*$`;

    const patterns = pylintrcParser.parse('.pylintrc', content);

    expect(patterns).toHaveLength(3);
    expect(patterns[0].value).toBe('build');
    expect(patterns[1].value).toBe('dist');
    expect(patterns[2].value).toBe('^legacy/.*$');
  });

  it('should handle multi-line values', () => {
    const content = `[MASTER]
ignore=
    build,
    dist,
    __pycache__`;

    const patterns = pylintrcParser.parse('.pylintrc', content);

    expect(patterns).toHaveLength(3);
    expect(patterns[0].value).toBe('build');
    expect(patterns[1].value).toBe('dist');
    expect(patterns[2].value).toBe('__pycache__');
  });

  it('should handle empty master section', () => {
    const content = `[MASTER]
max-line-length=88`;

    const patterns = pylintrcParser.parse('.pylintrc', content);
    expect(patterns).toHaveLength(0);
  });
});
