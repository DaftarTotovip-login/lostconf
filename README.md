# lostconf

[![CI](https://github.com/lostconf/lostconf/actions/workflows/ci.yml/badge.svg)](https://github.com/lostconf/lostconf/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/lostconf.svg)](https://www.npmjs.com/package/lostconf)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A meta-linter that validates and detects stale references in configuration files across languages and tools.

## The Problem

Linter configs accumulate exclusions over time. Files get deleted, patterns become stale, but configs are never cleaned up. This leads to:

- **Confusing config files** full of dead references that nobody understands
- **Security risks** when exclusions outlive the code they were meant to exclude
- **Maintenance burden** when trying to understand what's actually being ignored
- **False confidence** in your linting when patterns no longer match anything

## The Solution

lostconf scans your config files, extracts path/glob/regex patterns, validates them against your codebase, and reports dead references.

```
$ npx lostconf
.eslintignore:3    src/legacy/*.js       no matches
.rubocop.yml:47    spec/old_helper.rb    file not found
pyproject.toml:12  test_.*_old\.py       no matches

Found 3 stale patterns in 3 files
```

## Installation

Run directly with npx (no install required):

```bash
npx lostconf
```

Or install globally:

```bash
npm install -g lostconf
```

Or add to your project:

```bash
npm install --save-dev lostconf
```

## Quick Start

```bash
# Scan current directory
npx lostconf

# Scan specific paths
npx lostconf ./src ./lib

# Fail CI if stale patterns found
npx lostconf --fail-on-stale

# JSON output for automation
npx lostconf --format json
```

## Supported Config Files

lostconf supports **48+ configuration files** from popular tools across **15+ languages**:

### JavaScript/TypeScript
| File | Tool | What We Check |
|------|------|---------------|
| `.eslintignore` | ESLint | File paths and glob patterns in ignore list |
| `.prettierignore` | Prettier | File paths and glob patterns in ignore list |
| `tsconfig.json` | TypeScript | Files in `exclude`, `include` arrays |
| `jest.config.json` | Jest | Test paths, coverage paths, module paths |
| `.stylelintignore` | Stylelint | File paths and glob patterns in ignore list |
| `.stylelintrc.json` | Stylelint | Ignore patterns in config |
| `biome.json`, `biome.jsonc` | Biome | Patterns in `files.ignore`, `linter.ignore`, `formatter.ignore` |
| `deno.json`, `deno.jsonc` | Deno | Global `exclude`, `lint.exclude/include`, `fmt.exclude/include`, `test.exclude/include` |

### Python
| File | Tool | What We Check |
|------|------|---------------|
| `pyproject.toml` | pytest, coverage, mypy, ruff, black, isort | Test paths, source paths, exclude patterns, omit patterns |
| `.flake8` | Flake8 | Exclude patterns, extend-exclude, filename patterns, per-file-ignores |
| `setup.cfg` | Flake8 | `[flake8]` section exclude patterns |
| `.pylintrc`, `pylintrc` | Pylint | Ignore paths, ignore patterns in `[MASTER]`/`[MAIN]` section |
| `.bandit` | Bandit | Exclude directories, exclude files, test paths |
| `pyrightconfig.json` | Pyright | `include`, `exclude`, `ignore`, `extraPaths` patterns |

### Ruby
| File | Tool | What We Check |
|------|------|---------------|
| `.rubocop.yml` | RuboCop | Exclude patterns, Include patterns in AllCops |

### Go
| File | Tool | What We Check |
|------|------|---------------|
| `.golangci.yml` | golangci-lint | Skip-dirs, skip-files, exclude patterns |

### Rust
| File | Tool | What We Check |
|------|------|---------------|
| `rustfmt.toml` | rustfmt | Ignore patterns |
| `clippy.toml` | Clippy | Excluded files |

### Java
| File | Tool | What We Check |
|------|------|---------------|
| `checkstyle.xml` | Checkstyle | SuppressionFilter file attributes |
| `pmd.xml` | PMD | Exclude patterns in rulesets |
| `spotbugs.xml` | SpotBugs | Match/Class elements |

### Kotlin
| File | Tool | What We Check |
|------|------|---------------|
| `detekt.yml` | detekt | Excludes patterns in config |

### PHP
| File | Tool | What We Check |
|------|------|---------------|
| `phpcs.xml` | PHP_CodeSniffer | Exclude-pattern elements |
| `phpstan.neon` | PHPStan | Excludes_analyse, ignoreErrors paths |

### Swift
| File | Tool | What We Check |
|------|------|---------------|
| `.swiftlint.yml` | SwiftLint | Excluded paths, included paths |

### C/C++
| File | Tool | What We Check |
|------|------|---------------|
| `.clang-tidy` | clang-tidy | CheckOptions paths |
| `.clang-format` | clang-format | File patterns |

### Scala
| File | Tool | What We Check |
|------|------|---------------|
| `.scalafmt.conf` | Scalafmt | Project.excludeFilters |
| `.scalafix.conf` | Scalafix | Excludes patterns |

### Elixir
| File | Tool | What We Check |
|------|------|---------------|
| `.credo.exs` | Credo | Files.excluded paths |

### .NET
| File | Tool | What We Check |
|------|------|---------------|
| `.editorconfig` | EditorConfig | File globs and patterns |
| `Directory.Build.props` | MSBuild | Include/Exclude item patterns |

### Shell Scripts
| File | Tool | What We Check |
|------|------|---------------|
| `.shellcheckrc` | ShellCheck | Source-path directives |

### YAML
| File | Tool | What We Check |
|------|------|---------------|
| `.yamllint`, `.yamllint.yml` | yamllint | Ignore patterns, ignore-from-file paths |

### Terraform
| File | Tool | What We Check |
|------|------|---------------|
| `.tflint.hcl` | TFLint | Source paths, module directories, exclude patterns |

### Security
| File | Tool | What We Check |
|------|------|---------------|
| `.semgrep.yml`, `.semgrep.yaml` | Semgrep | `paths.exclude`, `paths.include` in rules |
| `.semgrepignore` | Semgrep | All ignore patterns (gitignore format) |
| `.gitleaks.toml` | Gitleaks | `allowlist.paths`, `allowlist.regexes`, rule-specific allowlists |

### Docker
| File | Tool | What We Check |
|------|------|---------------|
| `.hadolint.yaml`, `.hadolint.yml` | Hadolint | `ignored` patterns, `trustedRegistries` (non-URL paths) |

### General
| File | Tool | What We Check |
|------|------|---------------|
| `.gitignore` | Git | All file paths and patterns |
| `.dockerignore` | Docker | All file paths and patterns |
| `.markdownlintignore` | markdownlint | All file paths and patterns |

## What Does lostconf Validate?

lostconf extracts and validates three types of patterns from configuration files:

### Pattern Types

- **File Paths**: Direct references to files or directories (e.g., `src/legacy/old.js`)
- **Glob Patterns**: Wildcards and patterns (e.g., `**/*.test.js`, `*.py`)
- **Regex Patterns**: Regular expressions in certain config contexts (e.g., Python test file patterns)

### Validation Strategy by Tool

**Ignore Files** (`.gitignore`, `.eslintignore`, `.prettierignore`, etc.)
- Validates that each pattern matches at least one file in your codebase
- Warns about patterns that no longer match anything (stale patterns)

**Configuration Files with Path References** (`tsconfig.json`, `pyproject.toml`, etc.)
- Checks `exclude`, `include`, `ignore`, and similar fields
- Validates source paths, test paths, and coverage paths
- Ensures referenced files and directories exist

**Linter-Specific Configs**
- **ESLint/Prettier/Stylelint**: Ignore patterns
- **TypeScript**: Files in `exclude`/`include` arrays
- **Jest**: Test paths, coverage directories, module path mappings
- **Biome**: Ignore/include patterns across files, linter, and formatter sections
- **Python Tools** (pytest, mypy, ruff, black, isort, flake8, pylint, bandit): Source paths, test paths, exclude patterns
- **RuboCop**: Exclude/Include patterns in AllCops
- **Go** (golangci-lint): Skip directories and files
- **Rust** (rustfmt, clippy): Ignored file patterns
- **Java** (checkstyle, pmd, spotbugs): Suppression files and exclude patterns
- **Kotlin** (detekt): Exclude patterns
- **PHP** (phpcs, phpstan): Exclude patterns and ignored paths
- **Swift** (swiftlint): Excluded and included file paths
- **C/C++** (clang-tidy, clang-format): File patterns and paths
- **Scala** (scalafmt, scalafix): Exclude filters
- **Elixir** (credo): Excluded file paths
- **.NET** (editorconfig, MSBuild): File globs and item patterns
- **ShellCheck**: Source path references
- **yamllint**: Ignore patterns and ignore-from-file references
- **Terraform** (tflint): Module sources and exclude patterns

### What Causes a Stale Pattern?

1. **File Not Found** - A specific file or directory path doesn't exist
2. **No Matches** - A glob or regex pattern doesn't match any files in the codebase
3. **Invalid Pattern** - The pattern syntax is malformed

## CLI Reference

```
lostconf [options] [paths...]

Arguments:
  paths                Paths to scan (default: current directory)

Options:
  -V, --version        Show version number
  -f, --format <fmt>   Output format: text, json, sarif (default: text)
  -o, --output <file>  Write to file instead of stdout
  --include <glob...>  Only check matching config files
  --exclude <glob...>  Skip matching config files
  --fail-on-stale      Exit code 1 if stale patterns found
  -q, --quiet          Suppress non-error output
  -v, --verbose        Show debug info
  -h, --help           Show help
```

## Output Formats

### Text (Default)

Human-readable output with colors:

```
.eslintignore:3    src/legacy/*.js       no matches
.rubocop.yml:47    spec/old_helper.rb    file not found

Found 2 stale patterns in 2 files
```

### JSON

Machine-readable format for automation:

```bash
npx lostconf --format json
```

```json
{
  "findings": [
    {
      "file": ".eslintignore",
      "line": 3,
      "pattern": "src/legacy/*.js",
      "type": "glob",
      "reason": "no_matches",
      "parser": "eslintignore"
    }
  ],
  "summary": { "total": 1, "files": 1 }
}
```

### SARIF

[SARIF](https://sarifweb.azurewebsites.net/) format for IDE integration and GitHub Code Scanning:

```bash
npx lostconf --format sarif --output results.sarif
```

## CI Integration

### GitHub Actions

Basic usage:

```yaml
name: Lint
on: [push, pull_request]

jobs:
  lostconf:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npx lostconf --fail-on-stale
```

### GitHub Code Scanning with SARIF

```yaml
name: Code Scanning
on: [push, pull_request]

jobs:
  lostconf:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Run lostconf
        run: npx lostconf --format sarif --output results.sarif
        continue-on-error: true

      - name: Upload SARIF
        uses: github/codeql-action/upload-sarif@v3
        with:
          sarif_file: results.sarif
```

### Pre-commit Hook

Add to `.pre-commit-config.yaml`:

```yaml
repos:
  - repo: local
    hooks:
      - id: lostconf
        name: Check for stale config patterns
        entry: npx lostconf --fail-on-stale
        language: system
        pass_filenames: false
```

## Exit Codes

| Code | Description |
|------|-------------|
| 0 | Success (no stale patterns, or `--fail-on-stale` not set) |
| 1 | Stale patterns found (when `--fail-on-stale` is set) |
| 2 | Error (invalid arguments, file read errors, etc.) |

## Programmatic API

Use lostconf as a library in your Node.js scripts:

```typescript
import { createEngine, getBuiltinParsers } from 'lostconf';

async function checkConfigs() {
  const parsers = getBuiltinParsers();
  const engine = createEngine(parsers, {
    paths: ['.'],
    verbose: false
  });

  const result = await engine.run();

  console.log(`Found ${result.summary.total} stale patterns`);

  for (const finding of result.findings) {
    console.log(`${finding.file}:${finding.line} - ${finding.pattern}`);
  }
}

checkConfigs();
```

### Creating Custom Parsers

```typescript
import { createEngine, Parser, Pattern, PatternType } from 'lostconf';

const myParser: Parser = {
  name: 'my-tool',
  filePatterns: ['.mytoolrc', '**/.mytoolrc'],
  parse(filename: string, content: string): Pattern[] {
    const patterns: Pattern[] = [];
    // Parse your config format and extract patterns
    // ...
    return patterns;
  }
};

const engine = createEngine([myParser], { paths: ['.'] });
const result = await engine.run();
```

## Pattern Types

lostconf understands three types of patterns:

| Type | Description | Example |
|------|-------------|---------|
| `path` | Exact file or directory path | `src/legacy/old.js` |
| `glob` | Glob pattern with wildcards | `src/**/*.test.js` |
| `regex` | Regular expression | `test_.*_old\.py` |

## Stale Reasons

| Reason | Description |
|--------|-------------|
| `file_not_found` | The referenced file or directory doesn't exist |
| `no_matches` | The glob/regex pattern doesn't match any files |
| `invalid_pattern` | The pattern syntax is invalid |

## Contributing

Contributions are welcome! Here's how to get started:

```bash
# Clone the repository
git clone https://github.com/lostconf/lostconf.git
cd lostconf

# Install dependencies
npm install

# Build
npm run build

# Run tests
npm test

# Run linter
npm run lint

# Check formatting
npm run format:check

# Run lostconf on itself
npm run selfcheck
```

### Adding a New Parser

1. Create a new file in `src/parsers/`
2. Implement the `Parser` interface
3. Export the parser from `src/parsers/index.ts`
4. Add tests in `tests/parsers/`

## License

MIT
