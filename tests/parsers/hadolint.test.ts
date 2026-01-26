/**
 * Integration tests for Hadolint parser
 */

import { describe, it, expect } from 'vitest';
import { hadolintParser } from '../../src/parsers/hadolint.js';
import { PatternType } from '../../src/core/types.js';

describe('Hadolint Parser', () => {
  it('should parse .hadolint.yaml with ignored patterns', () => {
    const content = `ignored:
  - tests/**
  - "*.dockerfile"`;

    const patterns = hadolintParser.parse('.hadolint.yaml', content);

    expect(patterns).toHaveLength(2);
    expect(patterns[0]).toMatchObject({
      value: 'tests/**',
      type: PatternType.GLOB
    });
    expect(patterns[1]).toMatchObject({
      value: '*.dockerfile',
      type: PatternType.GLOB
    });
  });

  it('should parse trustedRegistries excluding URLs', () => {
    const content = `trustedRegistries:
  - docker.io
  - https://gcr.io
  - registry.local
  - http://localhost:5000`;

    const patterns = hadolintParser.parse('.hadolint.yaml', content);

    // URLs should be excluded, only local paths included
    expect(patterns).toHaveLength(2);
    expect(patterns[0].value).toBe('docker.io');
    expect(patterns[1].value).toBe('registry.local');
  });

  it('should handle both ignored and trustedRegistries', () => {
    const content = `ignored:
  - build/**
trustedRegistries:
  - docker.io
  - registry.local`;

    const patterns = hadolintParser.parse('.hadolint.yaml', content);

    expect(patterns.length).toBeGreaterThanOrEqual(2);
    const values = patterns.map((p) => p.value);
    expect(values).toContain('build/**');
    expect(values).toContain('docker.io');
  });

  it('should handle empty arrays', () => {
    const content = `ignored: []
trustedRegistries: []`;

    const patterns = hadolintParser.parse('.hadolint.yaml', content);
    expect(patterns).toHaveLength(0);
  });

  it('should handle invalid YAML gracefully', () => {
    const content = 'ignored: [[[';
    const patterns = hadolintParser.parse('.hadolint.yaml', content);
    expect(patterns).toHaveLength(0);
  });

  it('should detect glob patterns in ignored', () => {
    const content = `ignored:
  - tests/**/*.dockerfile
  - build
  - "*.tmp"`;

    const patterns = hadolintParser.parse('.hadolint.yaml', content);

    expect(patterns).toHaveLength(3);
    expect(patterns[0].type).toBe(PatternType.GLOB);
    expect(patterns[1].type).toBe(PatternType.PATH);
    expect(patterns[2].type).toBe(PatternType.GLOB);
  });

  it('should handle hadolint.yml extension', () => {
    const content = `ignored:
  - build/**`;

    const patterns = hadolintParser.parse('hadolint.yml', content);

    expect(patterns).toHaveLength(1);
    expect(patterns[0].value).toBe('build/**');
  });

  it('should parse full config with rules', () => {
    const content = `ignored:
  - vendor/**
trustedRegistries:
  - docker.io
failure-threshold: error
override:
  error:
    - DL3001`;

    const patterns = hadolintParser.parse('.hadolint.yaml', content);

    const values = patterns.map((p) => p.value);
    expect(values).toContain('vendor/**');
    expect(values).toContain('docker.io');
  });
});
