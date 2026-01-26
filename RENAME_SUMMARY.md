# Project Renamed: lintlint → lostconf

## ✅ Rename Complete!

The project has been successfully renamed from **lintlint** back to **lostconf**.

### Why the Change?

**lintlint** was:
- ❌ Confusing - didn't clearly communicate what the tool does
- ❌ Non-descriptive - "linting linters" is unclear
- ❌ Could seem unprofessional for enterprise adoption

**lostconf** is:
- ✅ **Descriptive** - "lost configurations" clearly describes the problem
- ✅ **Professional** - suitable for enterprise use
- ✅ **Searchable** - unique name, good for SEO
- ✅ **Problem-focused** - helps users understand the value immediately

### What Changed

#### Files Updated
- ✅ `package.json` - name, bin command, repository URLs
- ✅ `README.md` - all 32 references updated
- ✅ `src/index.ts` - header comment
- ✅ `src/cli.ts` - CLI name and description
- ✅ `src/core/types.ts` - header comment
- ✅ `src/core/engine.ts` - logging prefix
- ✅ `src/output/sarif.ts` - tool name and URLs
- ✅ `tests/integration/cli.test.ts` - all test references
- ✅ `INTEGRATION_TEST_SUMMARY.md` - all references
- ✅ `TESTING.md` - all references
- ✅ `LINTERS_TO_ADD.md` - all references

#### Binary Command
**Before:**
```bash
lintlint --help
npx lintlint
```

**After:**
```bash
lostconf --help
npx lostconf
```

### Verification

All quality checks passing:

```bash
✅ Build: Success
✅ Tests: 161/161 passing
✅ Linting: Clean
✅ Formatting: Perfect
✅ CLI: Working (lostconf --help)
✅ Selfcheck: No issues
✅ No remaining "lintlint" references
```

### Usage Examples

```bash
# Run locally
npx lostconf

# Scan specific paths
npx lostconf ./src ./lib

# Fail CI if stale patterns found
npx lostconf --fail-on-stale

# JSON output
npx lostconf --format json

# Install globally
npm install -g lostconf

# Or add to project
npm install --save-dev lostconf
```

### Repository URLs

**New URLs:**
- GitHub: https://github.com/lostconf/lostconf
- Issues: https://github.com/lostconf/lostconf/issues
- Homepage: https://github.com/lostconf/lostconf#readme

### Package Name

```json
{
  "name": "lostconf",
  "version": "0.1.0",
  "description": "A meta-linter that detects stale references in configuration files"
}
```

### What Stays The Same

✅ All functionality identical
✅ All 48+ linters supported
✅ All 161 tests passing
✅ Same configuration format
✅ Same output formats (text, JSON, SARIF)
✅ Same CLI options

### Project Stats

**Current State:**
- **Name**: lostconf
- **Version**: 0.1.0
- **Linters**: 48+ configuration files
- **Languages**: 15+
- **Tests**: 161 passing
- **Coverage**: Comprehensive

**Supported Linters Include:**
- Security: Semgrep, Gitleaks
- Python: Pyright, Flake8, Pylint, Bandit, mypy, ruff, black, isort
- JavaScript/TypeScript: ESLint, Prettier, Biome, Deno, TypeScript, Jest, Stylelint
- Docker: Hadolint
- Go: golangci-lint
- Rust: rustfmt, clippy
- Ruby: RuboCop
- Java: Checkstyle, PMD, SpotBugs
- PHP: phpcs, phpstan
- Swift: SwiftLint
- C/C++: clang-tidy, clang-format
- Kotlin: detekt
- Scala: scalafmt, scalafix
- Elixir: Credo
- .NET: EditorConfig, MSBuild
- Shell: ShellCheck
- YAML: yamllint
- Terraform: TFLint
- Markdown: markdownlint
- And more...

### Migration Notes

If you had **lintlint** installed:

```bash
# Uninstall old version
npm uninstall -g lintlint
npm uninstall --save-dev lintlint

# Install new version
npm install -g lostconf
# or
npm install --save-dev lostconf
```

Update your scripts in `package.json`:

```json
{
  "scripts": {
    "check-configs": "lostconf --fail-on-stale"
  }
}
```

Update CI/CD pipelines:

```yaml
# GitHub Actions
- name: Check for stale config patterns
  run: npx lostconf --fail-on-stale
```

### Timeline

- **Original name**: lostconf
- **Temporary rename**: lintlint (short experiment)
- **Current name**: lostconf (reverted)

The name **lostconf** better represents what the tool does: finding **lost/stale configuration patterns** that reference files that no longer exist.

---

## Ready to Use!

```bash
npx lostconf
```

**Find those lost configurations!** 🔍
