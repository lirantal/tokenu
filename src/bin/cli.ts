#!/usr/bin/env node
import { parseArgs } from 'node:util'
import { readFile } from 'node:fs/promises'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { walkAndCount, resolveEncoding, formatText, formatJson } from '../main.ts'
import type { CliOptions } from '../types.ts'

const HELP_TEXT = `Usage: tokenu [options] [path...]

A du-like CLI that counts token usage per file and directory.

Options:
  -s, --summarize        Display only a total for each argument
  -h, --human-readable   Print token counts in human-readable format (1K, 1M)
  -a, --all              Show counts for all files, not just directories
  -d, --max-depth <N>    Print totals only for directories N levels deep
  -c, --total            Produce a grand total
      --json             Output as JSON (for AI agent consumption)
      --encoding <enc>   Tokenizer encoding (default: o200k_base)
      --model <name>     Model name (e.g. gpt-4o, gpt-3.5-turbo)
      --exclude <pat>    Glob pattern to exclude (repeatable)
      --version          Print version and exit
      --help             Print this help and exit

Encodings: o200k_base, o200k_harmony, cl100k_base, p50k_base, p50k_edit, r50k_base

Examples:
  tokenu .                          Recursive token counts per directory
  tokenu -hs src/                   Human-readable summary of src/
  tokenu -a --json .                All files as JSON
  tokenu --encoding cl100k_base .   Use GPT-4/3.5 encoding
  tokenu -d 1 --total .             Depth-limited with grand total
`

async function getVersion (): Promise<string> {
  const currentDir = dirname(fileURLToPath(import.meta.url))
  const pkgPath = resolve(currentDir, '..', '..', 'package.json')
  try {
    const raw = await readFile(pkgPath, 'utf-8')
    const pkg = JSON.parse(raw) as { version: string }
    return pkg.version
  } catch {
    return '0.0.0'
  }
}

async function main (): Promise<void> {
  const { values, positionals } = parseArgs({
    options: {
      summarize: { type: 'boolean', short: 's', default: false },
      'human-readable': { type: 'boolean', short: 'h', default: false },
      all: { type: 'boolean', short: 'a', default: false },
      'max-depth': { type: 'string', short: 'd' },
      total: { type: 'boolean', short: 'c', default: false },
      json: { type: 'boolean', default: false },
      encoding: { type: 'string' },
      model: { type: 'string' },
      exclude: { type: 'string', multiple: true },
      version: { type: 'boolean', default: false },
      help: { type: 'boolean', default: false },
    },
    allowPositionals: true,
    strict: true,
  })

  if (values.help) {
    process.stdout.write(HELP_TEXT)
    return
  }

  if (values.version) {
    const version = await getVersion()
    process.stdout.write(`${version}\n`)
    return
  }

  const maxDepthRaw = values['max-depth']
  let maxDepth: number | undefined
  if (maxDepthRaw !== undefined) {
    maxDepth = parseInt(maxDepthRaw, 10)
    if (Number.isNaN(maxDepth) || maxDepth < 0) {
      process.stderr.write(`tokenu: invalid max depth: ${maxDepthRaw}\n`)
      process.exitCode = 1
      return
    }
  }

  const encoding = resolveEncoding(values.encoding, values.model)
  const paths = positionals.length > 0 ? positionals : ['.']
  const excludePatterns = values.exclude ?? []

  const cliOptions: CliOptions = {
    summarize: values.summarize ?? false,
    humanReadable: values['human-readable'] ?? false,
    all: values.all ?? false,
    maxDepth,
    total: values.total ?? false,
    json: values.json ?? false,
    encoding,
    model: values.model,
    exclude: excludePatterns,
    paths,
  }

  try {
    const results = await walkAndCount(paths, {
      all: cliOptions.all,
      maxDepth: cliOptions.maxDepth,
      encoding: cliOptions.encoding,
      model: cliOptions.model,
      exclude: cliOptions.exclude,
    })

    let output: string
    if (cliOptions.json) {
      const version = await getVersion()
      output = formatJson(results, cliOptions, version)
    } else {
      output = formatText(results, cliOptions)
    }

    process.stdout.write(output + '\n')
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    process.stderr.write(`tokenu: ${message}\n`)
    process.exitCode = 1
  }
}

main()
