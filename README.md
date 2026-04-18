# GitHub Spell Checker

A structured custom spell checker for repositories that want a simple, GitHub-friendly quality check for documentation and source files.

## What it is

This project is a small Node.js-based spell checker that scans repository files, finds likely misspellings, and fails CI when problems are found.

It is designed for:

- documentation quality checks
- pull request validation
- release note and Markdown verification
- lightweight repository hygiene checks

It now supports both text-heavy files and many source-code formats while still trying to avoid noisy false positives from identifiers and syntax.

## What it does

- Scans docs, config files, and many source-code formats by default
- Ignores URLs, file paths, hashes, numbers, and inline code
- Skips fenced code blocks inside Markdown files
- Extracts comments and docstrings from source files instead of checking raw code
- Extracts visible text from HTML instead of checking attributes and tag names
- Extracts CSS comments instead of checking class selectors
- Supports an allowlist for project-specific words
- Returns a non-zero exit code when possible misspellings are found
- Includes automated tests and fixture-based examples
- Runs cleanly in GitHub Actions

## How it works

The checker runs in a few simple steps:

1. It loads the default or custom config file.
2. It loads the default or custom allowlist file.
3. It walks through the target directory and collects matching files.
4. It extracts the human-written text that should be checked for that file type.
5. It extracts normal words and checks them against the English dictionary.
6. It skips words that are present in the allowlist.
7. It prints findings in a readable format and exits with status code `1` if any misspellings are found.

This makes it easy to use in local development and in CI pipelines.

## Supported formats

The default config supports a broad set of common repository files.

Docs and config:

- `.md`
- `.txt`
- `.rst`
- `.adoc`
- `.yml`
- `.yaml`
- `.toml`
- `.ini`
- `.cfg`
- `.conf`
- `.properties`

Source files:

- `.py`
- `.js`
- `.jsx`
- `.ts`
- `.tsx`
- `.c`
- `.h`
- `.cpp`
- `.cc`
- `.cxx`
- `.hpp`
- `.java`
- `.pl`
- `.pm`
- `.r`
- `.rmd`
- `.lua`
- `.dart`
- `.groovy`
- `.gradle`
- `.m`
- `.matlab`
- `.jl`
- `.ex`
- `.exs`
- `.erl`
- `.hrl`
- `.hs`
- `.lhs`
- `.clj`
- `.cljs`
- `.cljc`
- `.edn`
- `.lisp`
- `.el`
- `.scm`
- `.ss`
- `.f90`
- `.f95`
- `.f03`
- `.f08`
- `.nim`
- `.tcl`
- `.tex`
- `.dockerfile`
- `.sh`
- `.bash`
- `.zsh`
- `.ps1`
- `.rb`
- `.go`
- `.rs`
- `.php`
- `.cs`
- `.kt`
- `.swift`
- `.scala`
- `.vue`
- `.svelte`
- `.sql`
- `.html`
- `.htm`
- `.xml`
- `.css`
- `.scss`
- `.sass`
- `.less`

## What gets checked

The checker intentionally does not spell-check every token in every file. It tries to focus on human-written text.

Checked by default:

- Markdown and text content
- YAML and common config text
- Python comments and docstrings
- JavaScript and TypeScript comments
- C, C++, Java, C#, Go, Rust, PHP, Kotlin, Swift, Scala, and SQL comments
- Shell, Perl, Ruby, R, Julia, Elixir, Tcl, and PowerShell comments
- Lua and Haskell comments
- Erlang, TeX, and MATLAB-style percent comments
- Clojure, Lisp, Scheme, and Emacs Lisp semicolon comments
- HTML visible text and HTML comments
- CSS and stylesheet comments

Ignored by default:

- variable names
- function names
- imports
- class names
- JSX and HTML attributes
- CSS class names
- framework-specific identifiers
- most raw code syntax

This balance keeps the checker useful across many languages without flooding CI with false positives.

## Project layout

```text
spell-checker/
  bin/
    spell-checker.js
  config/
    default.config.json
    default.allowlist.txt
  src/
    checker.js
    cli.js
    config.js
    dictionary.js
    file-system.js
    reporter.js
    tokenizer.js
tests/
  configs/
  fixtures/
  spell-checker.test.js
.github/
  workflows/
    spellcheck.yml
```

## Main folders

- `spell-checker/bin`
  CLI entry point for running the tool
- `spell-checker/src`
  Core implementation split into small modules
- `spell-checker/config`
  Default config and default allowlist
- `tests/configs`
  Test-specific config files and allowlists
- `tests/fixtures`
  Passing and failing sample files used by tests
- `.github/workflows`
  GitHub Actions workflow for CI

## Requirements

- Node.js 20 or newer is recommended
- npm

## Installation

Clone or copy the project into your repository, then install dependencies:

```bash
npm install
```

If you want to use this as a standalone internal tool, keep the current structure and run it through the provided npm scripts.

## Setup

The project already comes with:

- a default config file at `spell-checker/config/default.config.json`
- a default allowlist at `spell-checker/config/default.allowlist.txt`
- a GitHub Actions workflow at `.github/workflows/spellcheck.yml`

You can start using it immediately after installing dependencies.

## Usage

Run the default spell check:

```bash
npm run spellcheck
```

Run with verbose file-by-file output:

```bash
npm run spellcheck:verbose
```

Run the CLI directly:

```bash
node spell-checker/bin/spell-checker.js
```

Run against a custom target folder:

```bash
node spell-checker/bin/spell-checker.js --target .
```

Run with a custom config and custom allowlist:

```bash
node spell-checker/bin/spell-checker.js --config tests/configs/base.config.json --allowlist tests/configs/custom.allowlist.txt
```

## CLI options

- `--target`
  Root folder to scan
- `--config`
  Path to a JSON config file
- `--allowlist`
  Path to a text file containing allowed words
- `--verbose`
  Prints each scanned file

## Configuration

The default config file is:

`spell-checker/config/default.config.json`

It controls:

- `includeExtensions`
  Which file types are scanned
- `ignoreDirectories`
  Which directories are skipped
- `ignoreFiles`
  Which files are skipped
- `minWordLength`
  Minimum word length to check

Example:

```json
{
  "includeExtensions": [".md", ".txt", ".yml", ".yaml"],
  "ignoreDirectories": [".git", ".github", "node_modules", "dist", "build", "coverage", "tests"],
  "ignoreFiles": ["package-lock.json"],
  "minWordLength": 3
}
```

You can widen or narrow support by editing `includeExtensions`.

## Allowlist

The default allowlist file is:

`spell-checker/config/default.allowlist.txt`

Use it for words that are valid in your project but may not exist in the default English dictionary, such as:

- product names
- internal service names
- abbreviations
- technical jargon

Add one word per line.

Example:

```text
githubactions
spellforge
workflowly
```

## Testing

Run the tests with:

```bash
npm test
```

The current tests cover:

- passing fixture content
- failing fixture content
- custom allowlist behavior
- source-file identifier filtering across multiple languages

Fixtures live in `tests/fixtures`, and test config files live in `tests/configs`.

## GitHub Actions integration

This repository already includes a workflow file:

`.github/workflows/spellcheck.yml`

The workflow:

1. checks out the repository
2. installs dependencies with `npm ci`
3. runs `npm test`
4. runs `npm run spellcheck`

This means pull requests and pushes will automatically fail if tests break or misspellings are detected.

## Example output

```text
Spell check failed. Possible misspellings:
- docs/guide.md:8 -> conection
- CHANGELOG.md:12 -> relase
```

## Typical customization ideas

- scan additional file types
- add repository-specific allowlist words
- exclude generated content folders
- report findings as GitHub annotations
- package the tool as a reusable npm CLI
- add richer parsing for JSX text nodes or string literals if your team wants that behavior

## Current npm scripts

```json
{
  "spellcheck": "node spell-checker/bin/spell-checker.js",
  "spellcheck:verbose": "node spell-checker/bin/spell-checker.js --verbose",
  "test": "node --test tests/*.test.js"
}
```
