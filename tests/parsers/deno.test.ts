/**
 * Integration tests for Deno parser
 */

import { describe, it, expect } from 'vitest';
import { denoParser } from '../../src/parsers/deno.js';
import { PatternType } from '../../src/core/types.js';

describe('Deno Parser', () => {
  it('should parse deno.json with exclude', () => {
    const content = `{
  "exclude": [
    "node_modules",
    "build/**",
    "dist"
  ]
}`;

    const patterns = denoParser.parse('deno.json', content);

    expect(patterns).toHaveLength(3);
    expect(patterns[0].value).toBe('node_modules');
    expect(patterns[1]).toMatchObject({
      value: 'build/**',
      type: PatternType.GLOB
    });
    expect(patterns[2].value).toBe('dist');
  });

  it('should parse deno.jsonc with comments', () => {
    const content = `{
  // Exclude build artifacts
  "exclude": [
    "dist",
    /* node modules */
    "node_modules"
  ]
}`;

    const patterns = denoParser.parse('deno.jsonc', content);

    expect(patterns).toHaveLength(2);
    expect(patterns[0].value).toBe('dist');
    expect(patterns[1].value).toBe('node_modules');
  });

  it('should parse lint.exclude patterns', () => {
    const content = `{
  "lint": {
    "exclude": [
      "generated/**",
      "*.min.js"
    ]
  }
}`;

    const patterns = denoParser.parse('deno.json', content);

    expect(patterns).toHaveLength(2);
    expect(patterns[0].value).toBe('generated/**');
    expect(patterns[1].value).toBe('*.min.js');
  });

  it('should parse lint.include patterns', () => {
    const content = `{
  "lint": {
    "include": ["src/**/*.ts", "lib"]
  }
}`;

    const patterns = denoParser.parse('deno.json', content);

    expect(patterns).toHaveLength(2);
    const values = patterns.map((p) => p.value);
    expect(values).toContain('lib');
  });

  it('should parse fmt.exclude patterns', () => {
    const content = `{
  "fmt": {
    "exclude": ["vendor/**", "*.generated.ts"]
  }
}`;

    const patterns = denoParser.parse('deno.json', content);

    expect(patterns).toHaveLength(2);
    expect(patterns[0].value).toBe('vendor/**');
    expect(patterns[1].value).toBe('*.generated.ts');
  });

  it('should parse test.exclude patterns', () => {
    const content = `{
  "test": {
    "exclude": ["fixtures/**"]
  }
}`;

    const patterns = denoParser.parse('deno.json', content);

    expect(patterns).toHaveLength(1);
    expect(patterns[0].value).toBe('fixtures/**');
  });

  it('should parse all sections combined', () => {
    const content = `{
  "exclude": ["node_modules"],
  "lint": {
    "exclude": ["generated/**"]
  },
  "fmt": {
    "exclude": ["vendor/**"]
  },
  "test": {
    "exclude": ["fixtures/**"]
  }
}`;

    const patterns = denoParser.parse('deno.json', content);

    expect(patterns).toHaveLength(4);
    const values = patterns.map((p) => p.value);
    expect(values).toContain('node_modules');
    expect(values).toContain('generated/**');
    expect(values).toContain('vendor/**');
    expect(values).toContain('fixtures/**');
  });

  it('should handle include and exclude in same section', () => {
    const content = `{
  "lint": {
    "include": ["src"],
    "exclude": ["src/legacy"]
  }
}`;

    const patterns = denoParser.parse('deno.json', content);

    expect(patterns).toHaveLength(2);
    const values = patterns.map((p) => p.value);
    expect(values).toContain('src');
    expect(values).toContain('src/legacy');
  });

  it('should handle empty arrays', () => {
    const content = `{
  "exclude": [],
  "lint": { "exclude": [] }
}`;

    const patterns = denoParser.parse('deno.json', content);
    expect(patterns).toHaveLength(0);
  });

  it('should handle invalid JSON gracefully', () => {
    const content = '{ invalid json }';
    const patterns = denoParser.parse('deno.json', content);
    expect(patterns).toHaveLength(0);
  });

  it('should detect glob patterns', () => {
    const content = `{
  "exclude": [
    "**/*.test.ts",
    "*.min.js",
    "vendor"
  ]
}`;

    const patterns = denoParser.parse('deno.json', content);

    expect(patterns[0].type).toBe(PatternType.GLOB);
    expect(patterns[1].type).toBe(PatternType.GLOB);
    expect(patterns[2].type).toBe(PatternType.PATH);
  });

  it('should handle full deno config', () => {
    const content = `{
  "compilerOptions": {
    "lib": ["dom", "esnext"]
  },
  "exclude": ["build"],
  "lint": {
    "rules": {
      "tags": ["recommended"]
    },
    "exclude": ["generated/**"]
  },
  "fmt": {
    "useTabs": false,
    "lineWidth": 100,
    "exclude": ["vendor/**"]
  }
}`;

    const patterns = denoParser.parse('deno.json', content);

    expect(patterns.length).toBeGreaterThanOrEqual(3);
    const values = patterns.map((p) => p.value);
    expect(values).toContain('build');
    expect(values).toContain('generated/**');
    expect(values).toContain('vendor/**');
  });
});
