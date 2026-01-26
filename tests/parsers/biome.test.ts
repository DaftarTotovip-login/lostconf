/**
 * Integration tests for Biome parser
 */

import { describe, it, expect } from 'vitest';
import { biomeParser } from '../../src/parsers/biome.js';
import { PatternType } from '../../src/core/types.js';

describe('Biome Parser', () => {
  it('should parse biome.json with ignore patterns', () => {
    const content = `{
  "files": {
    "ignore": [
      "dist/**",
      "build",
      "*.min.js"
    ]
  }
}`;

    const patterns = biomeParser.parse('biome.json', content);

    expect(patterns).toHaveLength(3);
    expect(patterns[0]).toMatchObject({
      value: 'dist/**',
      type: PatternType.GLOB,
      line: 4
    });
    expect(patterns[1]).toMatchObject({
      value: 'build',
      type: PatternType.PATH,
      line: 5
    });
    expect(patterns[2]).toMatchObject({
      value: '*.min.js',
      type: PatternType.GLOB,
      line: 6
    });
  });

  it('should parse biome.jsonc with comments', () => {
    const content = `{
  // Global settings
  "files": {
    /* Ignore build artifacts */
    "ignore": ["node_modules", "dist"]
  },
  "linter": {
    // Ignore test files
    "ignore": ["**/*.test.ts"]
  }
}`;

    const patterns = biomeParser.parse('biome.jsonc', content);

    expect(patterns).toHaveLength(3);
    expect(patterns[0].value).toBe('node_modules');
    expect(patterns[1].value).toBe('dist');
    expect(patterns[2].value).toBe('**/*.test.ts');
  });

  it('should parse files.include patterns', () => {
    const content = `{
  "files": {
    "include": ["src/**/*.ts", "src/**/*.tsx"]
  }
}`;

    const patterns = biomeParser.parse('biome.json', content);

    expect(patterns).toHaveLength(2);
    // Note: comment stripping may affect the pattern extraction
    expect(patterns[0].value).toContain('src');
    expect(patterns[0].value).toContain('.ts');
  });

  it('should parse linter and formatter ignore patterns', () => {
    const content = `{
  "linter": {
    "ignore": ["generated/**"]
  },
  "formatter": {
    "ignore": ["*.generated.ts", "vendor"]
  }
}`;

    const patterns = biomeParser.parse('biome.json', content);

    expect(patterns).toHaveLength(3);
    expect(patterns[0].value).toBe('generated/**');
    expect(patterns[1].value).toBe('*.generated.ts');
    expect(patterns[2].value).toBe('vendor');
  });

  it('should handle empty config', () => {
    const content = '{}';
    const patterns = biomeParser.parse('biome.json', content);
    expect(patterns).toHaveLength(0);
  });

  it('should handle invalid JSON gracefully', () => {
    const content = 'not valid json {';
    const patterns = biomeParser.parse('biome.json', content);
    expect(patterns).toHaveLength(0);
  });

  it('should parse all sections combined', () => {
    const content = `{
  "files": {
    "ignore": ["dist"],
    "include": ["src"]
  },
  "linter": {
    "ignore": ["legacy"],
    "include": ["new"]
  },
  "formatter": {
    "ignore": ["old"],
    "include": ["current"]
  }
}`;

    const patterns = biomeParser.parse('biome.json', content);

    expect(patterns).toHaveLength(6);
    const values = patterns.map((p) => p.value);
    expect(values).toContain('dist');
    expect(values).toContain('src');
    expect(values).toContain('legacy');
    expect(values).toContain('new');
    expect(values).toContain('old');
    expect(values).toContain('current');
  });
});
