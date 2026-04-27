<!-- markdownlint-disable -->

<p align="center">
  <h1 align="center">
  tokenu
  </h1>
</p>

<p align="center">
  <img width="1216" height="884" alt="tokenu-screenshot" src="https://github.com/user-attachments/assets/7186f3ec-505f-4db2-8927-81686462903b" />
</p>

<p align="center">
  A Unix <code>du</code>-like CLI that counts token usage per file and directory.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/tokenu"><img src="https://badgen.net/npm/v/tokenu" alt="npm version"/></a>
  <a href="https://www.npmjs.com/package/tokenu"><img src="https://badgen.net/npm/license/tokenu" alt="license"/></a>
  <a href="https://www.npmjs.com/package/tokenu"><img src="https://badgen.net/npm/dt/tokenu" alt="downloads"/></a>
  <a href="https://github.com/lirantal/tokenu/actions/workflows/ci.yml"><img src="https://github.com/lirantal/tokenu/actions/workflows/ci.yml/badge.svg?branch=main" alt="build"/></a>
  <a href="https://app.codecov.io/gh/lirantal/tokenu"><img src="https://badgen.net/codecov/c/github/lirantal/tokenu" alt="codecov"/></a>
  <a href="./SECURITY.md"><img src="https://img.shields.io/badge/Security-Responsible%20Disclosure-yellow.svg" alt="Responsible Disclosure Policy" /></a>
</p>

## Quick Start

No install needed — run it directly with npx:

```sh
npx tokenu .
```

Or install it globally:

```sh
npm install -g tokenu
```

## Usage

```sh
tokenu [options] [path...]
```

### Options

| Flag | Description |
|---|---|
| `-s, --summarize` | Display only a total for each argument |
| `-h, --human-readable` | Print token counts in human-readable format (1K, 1M) |
| `-a, --all` | Show counts for all files, not just directories |
| `-d, --max-depth <N>` | Print totals only for directories N levels deep |
| `-c, --total` | Produce a grand total |
| `--json` | Output as JSON (for AI agent consumption) |
| `--encoding <enc>` | Tokenizer encoding (default: `o200k_base`) |
| `--model <name>` | Model name (e.g. `gpt-4o`, `gpt-3.5-turbo`) |
| `--exclude <pat>` | Glob pattern to exclude (repeatable) |

Supported encodings: `o200k_base`, `o200k_harmony`, `cl100k_base`, `p50k_base`, `p50k_edit`, `r50k_base`

### Examples

Recursive token counts per directory:

```sh
$ tokenu -a src/
1127	src/bin/cli.ts
1127	src/bin
783	src/formatter.ts
256	src/main.ts
324	src/tokenizer.ts
165	src/types.ts
735	src/walker.ts
3390	src
```

Human-readable summary:

```sh
$ tokenu -hs src/
3.4K	src
```

Depth-limited with grand total:

```sh
$ tokenu -d 1 --total myproject/
4143	myproject/tests
2019	myproject/docs
2263	myproject/src
12241	myproject/dist
20666	myproject
20666	total
```

JSON output (useful for piping to other tools or AI agents):

```sh
$ tokenu -a --json src/
```

Use a specific encoding for older models:

```sh
$ tokenu --encoding cl100k_base .
```

## Contributing

Please consult [CONTRIBUTING](./.github/CONTRIBUTING.md) for guidelines on contributing to this project.

## Author

**tokenu** © [Liran Tal](https://github.com/lirantal), Released under the [Apache-2.0](./LICENSE) License.
