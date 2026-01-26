/**
 * Parser exports
 */

// General
export { gitignoreParser, dockerignoreParser, createIgnoreParser } from './gitignore.js';

// JavaScript/TypeScript
export { eslintIgnoreParser } from './eslint.js';
export { prettierIgnoreParser } from './prettier.js';
export { tsconfigParser } from './typescript.js';
export { jestConfigParser } from './jest.js';
export { stylelintIgnoreParser, stylelintRcParser } from './stylelint.js';
export { biomeParser } from './biome.js';
export { denoParser } from './deno.js';

// Python
export { pyprojectParser } from './pyproject.js';
export { flake8Parser, flake8SetupCfgParser } from './flake8.js';
export { pylintrcParser } from './pylint.js';
export { banditParser } from './bandit.js';
export { pyrightParser } from './pyright.js';

// Ruby
export { rubocopParser } from './rubocop.js';

// Go
export { golangciParser } from './golangci.js';

// Rust
export { rustfmtParser, clippyParser } from './rust.js';

// Java
export { checkstyleParser, pmdParser, spotbugsParser } from './java.js';

// PHP
export { phpcsParser, phpstanParser } from './php.js';

// Swift
export { swiftlintParser } from './swift.js';

// C/C++
export { clangTidyParser, clangFormatParser } from './clang.js';

// Kotlin
export { detektParser } from './kotlin.js';

// Scala
export { scalafmtParser, scalafixParser } from './scala.js';

// Elixir
export { credoParser } from './elixir.js';

// .NET
export { editorConfigParser, buildPropsParser } from './dotnet.js';

// Markdown
export { markdownlintIgnoreParser } from './markdown.js';

// Shell
export { shellcheckParser } from './shellcheck.js';

// YAML
export { yamllintParser } from './yamllint.js';

// Terraform
export { tflintParser } from './tflint.js';

// Security
export { semgrepYmlParser, semgrepIgnoreParser } from './semgrep.js';
export { gitleaksParser } from './gitleaks.js';

// Docker
export { hadolintParser } from './hadolint.js';

import type { Parser } from '../plugin/types.js';

// Import all parsers for getBuiltinParsers
import { gitignoreParser, dockerignoreParser } from './gitignore.js';
import { eslintIgnoreParser } from './eslint.js';
import { prettierIgnoreParser } from './prettier.js';
import { tsconfigParser } from './typescript.js';
import { jestConfigParser } from './jest.js';
import { stylelintIgnoreParser, stylelintRcParser } from './stylelint.js';
import { biomeParser } from './biome.js';
import { denoParser } from './deno.js';
import { pyprojectParser } from './pyproject.js';
import { flake8Parser, flake8SetupCfgParser } from './flake8.js';
import { pylintrcParser } from './pylint.js';
import { banditParser } from './bandit.js';
import { pyrightParser } from './pyright.js';
import { rubocopParser } from './rubocop.js';
import { golangciParser } from './golangci.js';
import { rustfmtParser, clippyParser } from './rust.js';
import { checkstyleParser, pmdParser, spotbugsParser } from './java.js';
import { phpcsParser, phpstanParser } from './php.js';
import { swiftlintParser } from './swift.js';
import { clangTidyParser, clangFormatParser } from './clang.js';
import { detektParser } from './kotlin.js';
import { scalafmtParser, scalafixParser } from './scala.js';
import { credoParser } from './elixir.js';
import { editorConfigParser, buildPropsParser } from './dotnet.js';
import { markdownlintIgnoreParser } from './markdown.js';
import { shellcheckParser } from './shellcheck.js';
import { yamllintParser } from './yamllint.js';
import { tflintParser } from './tflint.js';
import { semgrepYmlParser, semgrepIgnoreParser } from './semgrep.js';
import { gitleaksParser } from './gitleaks.js';
import { hadolintParser } from './hadolint.js';

/** Get all built-in parsers */
export function getBuiltinParsers(): Parser[] {
  return [
    // General
    gitignoreParser,
    dockerignoreParser,

    // JavaScript/TypeScript
    eslintIgnoreParser,
    prettierIgnoreParser,
    tsconfigParser,
    jestConfigParser,
    stylelintIgnoreParser,
    stylelintRcParser,
    biomeParser,
    denoParser,

    // Python
    pyprojectParser,
    flake8Parser,
    flake8SetupCfgParser,
    pylintrcParser,
    banditParser,
    pyrightParser,

    // Ruby
    rubocopParser,

    // Go
    golangciParser,

    // Rust
    rustfmtParser,
    clippyParser,

    // Java
    checkstyleParser,
    pmdParser,
    spotbugsParser,

    // PHP
    phpcsParser,
    phpstanParser,

    // Swift
    swiftlintParser,

    // C/C++
    clangTidyParser,
    clangFormatParser,

    // Kotlin
    detektParser,

    // Scala
    scalafmtParser,
    scalafixParser,

    // Elixir
    credoParser,

    // .NET
    editorConfigParser,
    buildPropsParser,

    // Markdown
    markdownlintIgnoreParser,

    // Shell
    shellcheckParser,

    // YAML
    yamllintParser,

    // Terraform
    tflintParser,

    // Security
    semgrepYmlParser,
    semgrepIgnoreParser,
    gitleaksParser,

    // Docker
    hadolintParser
  ];
}
