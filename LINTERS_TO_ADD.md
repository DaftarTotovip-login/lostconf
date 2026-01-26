# Potential Linters to Add to lostconf

This document lists popular linters and code quality tools that are not yet supported by lostconf but would be valuable additions.

## High Priority

### JavaScript/TypeScript
- **Deno** (deno.json, deno.jsonc) - Deno runtime configuration with import maps and exclude patterns
- **Rome** (rome.json) - Predecessor to Biome, still used in some projects
- **XO** (.xo-config.json) - Opinionated but configurable ESLint wrapper
- **StandardJS** - JavaScript standard style linter
- **JSHint** (.jshintrc) - JavaScript code quality tool

### Python
- **Pyright** (pyrightconfig.json) - Microsoft's static type checker for Python
- **Pyre** (.pyre_configuration) - Facebook's type checker for Python
- **Vulture** (pyproject.toml or .vulture.ini) - Finds unused Python code
- **Radon** - Code metrics and complexity analyzer
- **Prospector** (.prospector.yaml) - Python static analysis tool wrapper

### Go
- **staticcheck** (staticcheck.conf) - Advanced Go linter
- **revive** (revive.toml) - Fast, extensible Go linter
- **golint** - Google's Go style linter

### Rust
- **cargo-deny** (deny.toml) - Cargo plugin for linting dependencies
- **cargo-audit** - Security vulnerability scanner

### Ruby
- **Reek** (.reek.yml) - Code smell detector for Ruby
- **Brakeman** - Security scanner for Rails applications
- **Flog** - Complexity metric tool
- **Fasterer** (.fasterer.yml) - Performance optimization suggestions

### Java/JVM
- **SonarLint** (sonarlint.xml) - IDE integration for SonarQube
- **Error Prone** - Static analysis for Java
- **Infer** (.inferconfig) - Facebook's static analyzer for Java, C, C++, Objective-C
- **Ktlint** (.editorconfig) - Kotlin linter with built-in formatter

### JavaScript Frontend
- **Lighthouse** (lighthouserc.json) - Automated auditing for web performance
- **axe-linter** - Accessibility linting
- **Webhint** (.hintrc) - Linting tool for web best practices

### CSS/SCSS
- **CSSLint** (.csslintrc) - CSS code quality tool
- **Sass Lint** (.sass-lint.yml) - Linter for Sass/SCSS
- **PostCSS** (postcss.config.js with plugins) - CSS transformation tool

### SQL
- **SQLFluff** (.sqlfluff) - SQL linter and auto-formatter
- **PGLint** - PostgreSQL-specific linter

### Shell
- **Shfmt** (.editorconfig) - Shell script formatter
- **Checkbashisms** - Checks for bashisms in /bin/sh scripts

### Docker
- **Hadolint** (.hadolint.yaml) - Dockerfile linter
- **Dockle** - Container image linter for security

### Infrastructure as Code
- **Checkov** (.checkov.yaml) - Infrastructure as code security scanner (Terraform, CloudFormation, etc.)
- **Terrascan** (terrascan.toml) - Security scanner for IaC
- **tfsec** - Security scanner for Terraform
- **Ansible Lint** (.ansible-lint) - Best practices checker for Ansible
- **CloudFormation Linter** (.cfnlintrc) - AWS CloudFormation template validator
- **Pulumi** - Infrastructure as code tool with policy packs

### YAML/JSON/Config Files
- **Ajv** - JSON Schema validator
- **JSON Lint** - JSON validator
- **Spectral** (.spectral.yaml) - OpenAPI/JSON/YAML linter
- **Prettier** (.prettierrc with file patterns) - Enhanced support for configuration

### Documentation
- **Vale** (.vale.ini) - Prose linter for documentation
- **Write Good** - English prose linter
- **Alex** (.alexrc) - Linter for insensitive, inconsiderate writing
- **Textlint** (.textlintrc) - Natural language linter

### Security
- **Semgrep** (.semgrep.yml, .semgrepignore) - Lightweight static analysis
- **Snyk** (.snyk) - Security vulnerability scanning
- **npm audit** (package.json with audit-level) - Node.js security auditing
- **Safety** - Python dependency vulnerability scanner
- **Trivy** (trivy.yaml) - Comprehensive security scanner
- **Gitleaks** (.gitleaks.toml) - Secrets detection

### Mobile Development
- **SwiftFormat** (.swiftformat) - Swift code formatter
- **Android Lint** (lint.xml) - Android project linter
- **Detekt** - Already supported, but enhance with more config options

### Web Assembly
- **wasm-pack** - WebAssembly packager with configuration

### Protocol Buffers
- **Buf** (buf.yaml) - Protobuf linter and breaking change detector

### API/OpenAPI
- **Spectral** (.spectral.yaml) - OpenAPI/AsyncAPI linter
- **Redoc** (redocly.yaml) - OpenAPI linter

### Markup Languages
- **HTMLHint** (.htmlhintrc) - HTML linter
- **Proselint** - Prose linter

## Medium Priority

### Build Tools
- **Webpack** (webpack.config.js) - Module bundler configuration patterns
- **Rollup** (rollup.config.js) - ES module bundler patterns
- **Vite** (vite.config.js) - Build tool configuration
- **Parcel** (.parcelrc) - Zero-config bundler

### Package Managers
- **pnpm** (.npmrc with pnpm-specific settings) - Fast, disk space efficient package manager
- **Yarn** (.yarnrc.yml) - Package manager patterns

### CI/CD
- **GitHub Actions** (.github/workflows/*.yml) - Validate referenced actions and paths
- **GitLab CI** (.gitlab-ci.yml) - Pipeline configuration validator
- **CircleCI** (.circleci/config.yml) - CI configuration
- **Jenkins** (Jenkinsfile) - Pipeline validation

### Monitoring/Observability
- **Prometheus** (prometheus.yml) - Monitoring configuration
- **Grafana** - Dashboard configurations

### Content Management
- **Contentlint** (.contentlintrc) - Content linter for various formats

## Implementation Priorities

### By Language Popularity (GitHub 2024)
1. **Python** - Pyright, Pyre (high demand)
2. **JavaScript/TypeScript** - Deno, XO (growing adoption)
3. **Go** - staticcheck, revive (community standard)
4. **Rust** - cargo-deny (security focus)
5. **Java** - Error Prone, SonarLint (enterprise need)

### By Use Case
1. **Security Scanners** - Semgrep, Snyk, Gitleaks (critical for DevSecOps)
2. **IaC Tools** - Checkov, Terrascan (cloud-native focus)
3. **Documentation** - Vale, Textlint (documentation quality)
4. **Container/Docker** - Hadolint, Dockle (containerization standard)
5. **API Validation** - Spectral (API-first development)

## Quick Wins (Easy to Implement)
- **HTMLHint** - Simple JSON config
- **Shfmt** - Uses .editorconfig (already have parser)
- **Deno** - JSON format similar to Biome
- **Hadolint** - YAML format
- **Gitleaks** - TOML format

## Notes on Implementation

### Pattern Types Support
Most of these linters support:
- File paths (direct file references)
- Glob patterns (wildcards)
- Regex patterns (in some cases)

### Common Configuration Formats
- JSON/JSONC (easiest to parse)
- YAML (already supported via `yaml` package)
- TOML (already supported via `smol-toml` package)
- INI-style (similar to flake8/pylint parsers)
- JavaScript/TypeScript config files (requires more complex parsing)

### Parser Complexity Levels
1. **Low** - Simple ignore lists in JSON/YAML
2. **Medium** - Nested configurations with multiple pattern fields
3. **High** - JavaScript configs requiring code execution or complex AST parsing
