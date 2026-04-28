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

## Why tokenu?

When we needed to find out which folder was eating up disk space, we reached for the classic Linux `du` command. Today, when writing code with LLMs and AI agents, the question has changed: **which folder is eating up my context window?**

Every time you feed files and directories into a prompt or a coding agent, it's easy to lose control — exceed the model's limits (GPT-5.5, Claude Opus 4.6, Sonnet 4.5, etc), or just burn money on unnecessary context. **tokenu** answers this question: run a single command and get a directory tree that reveals exactly how many tokens each part of your project consumes.

### What can you do with it?

- **Understand your project's token footprint** — before pasting a folder into an LLM, see how much of the context window it will consume.
- **Find expensive files** — discover that one auto-generated JSON, lockfile, or bundle that silently blows up your token budget.
- **Budget context for AI agents** — pipe `--json` output into an autonomous agent pipeline so the agent can plan which files to read within its "memory budget".
- **Guard your context with hooks** — build a pre-read hook for tools like Claude Code that blocks or warns before loading files above a certain token threshold, preventing a single huge file from clogging the entire context.
- **Compare encodings** — quickly see how token counts differ across models (`gpt-5.4` vs `claude-4.6-opus-high`) to estimate costs before switching.
- **Audit before you ship** — verify that your published package or documentation stays within a reasonable token size for consumers who use AI-assisted workflows.

## Quick Start

No install needed — run it directly with npx:

```sh
npx tokenu .
```

### Real-World Recipes

**Spot the context hog in your project:**

```sh
$ tokenu -d 1 -hs .
1.2K	./src
124	./docs
48.7K	./dist
890	./.github
50.9K	.
```

In this example `dist/` alone takes ~48K tokens — nearly the entire budget of some models. Now you know to exclude it or `.gitignore` it from your AI workflow.

**Feed an AI agent its token budget:**

```sh
$ tokenu --json -s . | your-agent --context-budget 128000
```

The agent receives structured JSON with per-directory token counts and can decide which parts of the codebase to load, staying within its context window.

**Quick-check a single file before pasting it into a prompt:**

```sh
$ tokenu -h data/large-fixture.json
23.6K	data/large-fixture.json
```

If a single file costs 23K tokens you probably want to summarize it first rather than dump it raw into your prompt.

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

## Install 

Local install:

```sh
npm install tokenu
```

or globally install the tokenu package in your development environment:

```sh
npm install -g tokenu
```

## FAQ

### Does tokenu replace token-saving tools like rtk?

No. [rtk](https://github.com/rtk-ai/rtk) is a CLI proxy that sits between your AI agent and the shell, actively filtering and compressing command outputs to reduce token consumption by 60-90%. It rewrites commands like `git status` or `cargo test` to return compact, token-efficient output.

**tokenu** does something different: it's a read-only measurement tool that tells you how many tokens your files and directories cost *before* they enter the context window. It doesn't modify or compress anything.

Think of it this way: rtk shrinks the output your agent *receives* from shell commands, while tokenu helps you understand the token cost of the files and directories you *feed* into a prompt or agent. They complement each other — use tokenu to plan your context budget, and rtk to keep command outputs lean.

### Does tokenu reduce my token usage?

Not directly. tokenu is a diagnostic tool — it reports token counts so *you* can make informed decisions. For example, you might discover a 40K-token auto-generated file sitting in your project root and decide to exclude it from your AI workflow, saving real money and context space.

### Can AI agents use tokenu?

Yes. Run `tokenu --json` to get structured output that an autonomous agent can consume programmatically. The agent can call tokenu, inspect the per-file and per-directory token counts, and decide which parts of the codebase fit within its context window — essentially giving it a "memory budget" to plan around.

### What's a practical example of using tokenu with coding agents?

Imagine you're running Claude Code (or a similar coding agent) in a project that contains a huge `data.json` file. Without realizing it, the agent loads that file into context and it consumes your entire context window, leaving no room for actual code.

With tokenu you can build a pre-read hook: before the agent reads any file, run `tokenu` on it. If the file exceeds a token threshold (say, 10K tokens), the hook can ask for confirmation or skip the file entirely. This keeps the agent focused on what matters.

## Contributing

Please consult [CONTRIBUTING](./.github/CONTRIBUTING.md) for guidelines on contributing to this project.

## Author

**tokenu** © [Liran Tal](https://github.com/lirantal), Released under the [Apache-2.0](./LICENSE) License.
