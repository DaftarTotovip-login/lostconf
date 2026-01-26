/**
 * Integration tests for ShellCheck parser
 */

import { describe, it, expect } from 'vitest';
import { shellcheckParser } from '../../src/parsers/shellcheck.js';
import { PatternType } from '../../src/core/types.js';

describe('ShellCheck Parser', () => {
  it('should parse .shellcheckrc with source-path', () => {
    const content = `source-path=SCRIPTDIR`;

    const patterns = shellcheckParser.parse('.shellcheckrc', content);

    expect(patterns).toHaveLength(1);
    expect(patterns[0]).toMatchObject({
      value: 'SCRIPTDIR',
      type: PatternType.PATH,
      line: 1
    });
  });

  it('should parse multiple paths separated by colon', () => {
    const content = `source-path=lib:src:scripts`;

    const patterns = shellcheckParser.parse('.shellcheckrc', content);

    expect(patterns).toHaveLength(3);
    expect(patterns[0].value).toBe('lib');
    expect(patterns[1].value).toBe('src');
    expect(patterns[2].value).toBe('scripts');
  });

  it('should parse paths with glob patterns', () => {
    const content = `source-path=lib/**:src/*.sh`;

    const patterns = shellcheckParser.parse('.shellcheckrc', content);

    expect(patterns).toHaveLength(2);
    expect(patterns[0]).toMatchObject({
      value: 'lib/**',
      type: PatternType.GLOB
    });
    expect(patterns[1]).toMatchObject({
      value: 'src/*.sh',
      type: PatternType.GLOB
    });
  });

  it('should ignore comments', () => {
    const content = `# This is a comment
source-path=lib
# Another comment
disable=SC2034`;

    const patterns = shellcheckParser.parse('.shellcheckrc', content);

    expect(patterns).toHaveLength(1);
    expect(patterns[0].value).toBe('lib');
  });

  it('should ignore non-path directives', () => {
    const content = `disable=SC2034,SC2086
shell=bash
source-path=lib
enable=all`;

    const patterns = shellcheckParser.parse('.shellcheckrc', content);

    expect(patterns).toHaveLength(1);
    expect(patterns[0].value).toBe('lib');
  });

  it('should handle empty source-path', () => {
    const content = `source-path=
disable=SC2034`;

    const patterns = shellcheckParser.parse('.shellcheckrc', content);
    expect(patterns).toHaveLength(0);
  });

  it('should handle complex paths', () => {
    const content = `source-path=/usr/local/lib:./scripts:../shared`;

    const patterns = shellcheckParser.parse('.shellcheckrc', content);

    expect(patterns).toHaveLength(3);
    expect(patterns[0].value).toBe('/usr/local/lib');
    expect(patterns[1].value).toBe('./scripts');
    expect(patterns[2].value).toBe('../shared');
  });

  it('should handle whitespace around equals', () => {
    const content = `source-path = lib : src : scripts`;

    const patterns = shellcheckParser.parse('.shellcheckrc', content);

    expect(patterns).toHaveLength(3);
    expect(patterns[0].value).toBe('lib');
    expect(patterns[1].value).toBe('src');
    expect(patterns[2].value).toBe('scripts');
  });

  it('should handle empty file', () => {
    const content = '';
    const patterns = shellcheckParser.parse('.shellcheckrc', content);
    expect(patterns).toHaveLength(0);
  });
});
