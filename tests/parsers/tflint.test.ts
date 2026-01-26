/**
 * Integration tests for TFLint parser
 */

import { describe, it, expect } from 'vitest';
import { tflintParser } from '../../src/parsers/tflint.js';
import { PatternType } from '../../src/core/types.js';

describe('TFLint Parser', () => {
  it('should parse .tflint.hcl with module source', () => {
    const content = `plugin "aws" {
  enabled = true
  source  = "github.com/terraform-linters/tflint-ruleset-aws"
}`;

    const patterns = tflintParser.parse('.tflint.hcl', content);

    expect(patterns).toHaveLength(1);
    expect(patterns[0]).toMatchObject({
      value: 'github.com/terraform-linters/tflint-ruleset-aws',
      type: PatternType.PATH
    });
  });

  it('should parse exclude patterns', () => {
    const content = `rule "terraform_naming_convention" {
  enabled = true
  exclude = ["tests/**", "examples/*"]
}`;

    const patterns = tflintParser.parse('.tflint.hcl', content);

    expect(patterns).toHaveLength(2);
    expect(patterns[0]).toMatchObject({
      value: 'tests/**',
      type: PatternType.GLOB
    });
    expect(patterns[1]).toMatchObject({
      value: 'examples/*',
      type: PatternType.GLOB
    });
  });

  it('should parse module_dir', () => {
    const content = `config {
  module_dir = "modules/production"
}`;

    const patterns = tflintParser.parse('.tflint.hcl', content);

    expect(patterns).toHaveLength(1);
    expect(patterns[0]).toMatchObject({
      value: 'modules/production',
      type: PatternType.PATH
    });
  });

  it('should parse disabled_by_default', () => {
    const content = `rule "terraform_deprecated_syntax" {
  enabled = true
  disabled_by_default = "legacy/**"
}`;

    const patterns = tflintParser.parse('.tflint.hcl', content);

    expect(patterns).toHaveLength(1);
    expect(patterns[0]).toMatchObject({
      value: 'legacy/**',
      type: PatternType.GLOB
    });
  });

  it('should parse multiple rules and plugins', () => {
    const content = `plugin "aws" {
  enabled = true
  source  = "github.com/terraform-linters/tflint-ruleset-aws"
}

rule "aws_instance_invalid_type" {
  enabled = true
  exclude = ["test/**", "*.auto.tf"]
}

config {
  module_dir = "modules"
}`;

    const patterns = tflintParser.parse('.tflint.hcl', content);

    expect(patterns).toHaveLength(4);
    expect(patterns[0].value).toBe('github.com/terraform-linters/tflint-ruleset-aws');
    expect(patterns[1].value).toBe('test/**');
    expect(patterns[2].value).toBe('*.auto.tf');
    expect(patterns[3].value).toBe('modules');
  });

  it('should handle comments', () => {
    const content = `# Plugin configuration
plugin "aws" {
  enabled = true
  # Source from GitHub
  source  = "github.com/example"
}

// Rule configuration
rule "example" {
  exclude = ["test/**"] // Exclude tests
}`;

    const patterns = tflintParser.parse('.tflint.hcl', content);

    expect(patterns).toHaveLength(2);
    expect(patterns[0].value).toBe('github.com/example');
    expect(patterns[1].value).toBe('test/**');
  });

  it('should handle exclude with single item', () => {
    const content = `rule "example" {
  exclude = ["single/path"]
}`;

    const patterns = tflintParser.parse('.tflint.hcl', content);

    expect(patterns).toHaveLength(1);
    expect(patterns[0].value).toBe('single/path');
  });

  it('should handle empty exclude array', () => {
    const content = `rule "example" {
  exclude = []
}`;

    const patterns = tflintParser.parse('.tflint.hcl', content);
    expect(patterns).toHaveLength(0);
  });

  it('should handle multiple patterns on same line', () => {
    const content = `rule "example" {
  exclude = ["tests/**", "examples/**", "*.backup.tf"]
}`;

    const patterns = tflintParser.parse('.tflint.hcl', content);

    expect(patterns).toHaveLength(3);
    expect(patterns[0].value).toBe('tests/**');
    expect(patterns[1].value).toBe('examples/**');
    expect(patterns[2].value).toBe('*.backup.tf');
  });

  it('should parse relative and absolute paths', () => {
    const content = `plugin "local" {
  source = "./plugins/local"
}

plugin "remote" {
  source = "/usr/local/tflint/plugins"
}`;

    const patterns = tflintParser.parse('.tflint.hcl', content);

    expect(patterns).toHaveLength(2);
    expect(patterns[0].value).toBe('./plugins/local');
    expect(patterns[1].value).toBe('/usr/local/tflint/plugins');
  });
});
