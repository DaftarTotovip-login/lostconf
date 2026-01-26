import { describe, it, expect } from 'vitest';
import { pyprojectParser } from '../../src/parsers/pyproject.js';
import { PatternType } from '../../src/core/types.js';

describe('pyprojectParser', () => {
  it('should have correct name and patterns', () => {
    expect(pyprojectParser.name).toBe('pyproject');
    expect(pyprojectParser.filePatterns).toContain('pyproject.toml');
  });

  it('should parse pytest testpaths', () => {
    const content = `
[tool.pytest.ini_options]
testpaths = ["tests", "integration_tests"]
`;
    const patterns = pyprojectParser.parse('pyproject.toml', content);

    expect(patterns.length).toBeGreaterThanOrEqual(2);
    expect(patterns.some((p) => p.value === 'tests')).toBe(true);
    expect(patterns.some((p) => p.value === 'integration_tests')).toBe(true);
  });

  it('should parse coverage omit patterns', () => {
    const content = `
[tool.coverage.run]
omit = ["tests/*", "setup.py"]
`;
    const patterns = pyprojectParser.parse('pyproject.toml', content);

    expect(patterns.some((p) => p.value === 'tests/*')).toBe(true);
    expect(patterns.some((p) => p.type === PatternType.GLOB)).toBe(true);
  });

  it('should parse ruff exclude patterns', () => {
    const content = `
[tool.ruff]
exclude = [".git", "node_modules", "*.pyi"]
`;
    const patterns = pyprojectParser.parse('pyproject.toml', content);

    expect(patterns.some((p) => p.value === '.git')).toBe(true);
    expect(patterns.some((p) => p.value === 'node_modules')).toBe(true);
    expect(patterns.some((p) => p.value === '*.pyi')).toBe(true);
  });

  it('should handle invalid TOML gracefully', () => {
    const content = `invalid toml content [[[`;
    const patterns = pyprojectParser.parse('pyproject.toml', content);
    expect(patterns).toEqual([]);
  });
});
