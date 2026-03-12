# Usage

tokenu is a du-like command-line tool that counts token usage per file and directory. It uses OpenAI-compatible BPE tokenization to give you an accurate picture of how many tokens your codebase consumes.

## Installation

```bash
npm install -g tokenu
```

Or with npx:

```bash
npx tokenu .
```

## Quick Start

Count tokens in the current directory:

```bash
tokenu .
```

Get a human-readable summary of a directory:

```bash
tokenu -hs src/
```

Show all files with their token counts:

```bash
tokenu -a src/
```

Output as JSON for AI agent consumption:

```bash
tokenu --json -s src/
```

## How It Works

tokenu recursively walks the specified directories and files, reads each text file, and counts tokens using the [gpt-tokenizer](https://github.com/niieani/gpt-tokenizer) library. Binary files are automatically detected and skipped. Directories like `node_modules` and `.git` are excluded by default.

The default tokenizer encoding is `o200k_base`, which is used by modern OpenAI models (GPT-4o, GPT-4.1, o1, o3, etc.). You can select a different encoding with the `--encoding` or `--model` flags.

## Output Format

By default, tokenu prints tab-separated lines with the token count and path, similar to `du`:

```
1234    ./src/main.ts
5678    ./src/bin/cli.ts
6912    ./src
```

Use `--json` for structured output suitable for programmatic consumption. See [json-output.md](json-output.md) for details.

## Programmatic API

tokenu also exports a programmatic API:

```typescript
import { walkAndCount, countFileTokens, getTokenCounter } from 'tokenu'

const results = await walkAndCount(['./src'], {
  all: true,
  encoding: 'o200k_base',
  exclude: [],
})

console.log(results)
```
