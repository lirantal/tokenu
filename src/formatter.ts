import type { CliOptions, JsonOutput, JsonOutputEntry, TokenResult } from './types.ts'

function humanReadableTokens (count: number): string {
  if (count >= 1_000_000) {
    const value = count / 1_000_000
    return value % 1 === 0 ? `${value}M` : `${value.toFixed(1)}M`
  }
  if (count >= 1_000) {
    const value = count / 1_000
    return value % 1 === 0 ? `${value}K` : `${value.toFixed(1)}K`
  }
  return count.toString()
}

function formatLine (tokens: number, path: string, humanReadable: boolean): string {
  const count = humanReadable ? humanReadableTokens(tokens) : tokens.toString()
  return `${count}\t${path}`
}

function collectTextLines (
  result: TokenResult,
  options: CliOptions,
  lines: string[],
  depth: number = 0
): void {
  if (result.isFile) {
    if (options.all) {
      lines.push(formatLine(result.tokens, result.path, options.humanReadable))
    }
    return
  }

  if (result.children) {
    for (const child of result.children) {
      if (options.maxDepth !== undefined && depth >= options.maxDepth) break
      collectTextLines(child, options, lines, depth + 1)
    }
  }

  lines.push(formatLine(result.tokens, result.path, options.humanReadable))
}

export function formatText (results: TokenResult[], options: CliOptions): string {
  const lines: string[] = []

  if (options.summarize) {
    for (const result of results) {
      lines.push(formatLine(result.tokens, result.path, options.humanReadable))
    }
  } else {
    for (const result of results) {
      collectTextLines(result, options, lines)
    }
  }

  if (options.total) {
    const grandTotal = results.reduce((sum, r) => sum + r.tokens, 0)
    lines.push(formatLine(grandTotal, 'total', options.humanReadable))
  }

  return lines.join('\n')
}

function collectJsonEntries (result: TokenResult, entries: JsonOutputEntry[]): void {
  if (result.isFile) {
    entries.push({
      path: result.path,
      tokens: result.tokens,
      type: 'file',
    })
    return
  }

  if (result.children) {
    for (const child of result.children) {
      collectJsonEntries(child, entries)
    }
  }

  entries.push({
    path: result.path,
    tokens: result.tokens,
    type: 'directory',
    children: result.children?.map(c => c.path),
  })
}

export function formatJson (
  results: TokenResult[],
  options: CliOptions,
  version: string
): string {
  const entries: JsonOutputEntry[] = []

  if (options.summarize) {
    for (const result of results) {
      entries.push({
        path: result.path,
        tokens: result.tokens,
        type: result.isFile ? 'file' : 'directory',
      })
    }
  } else {
    for (const result of results) {
      collectJsonEntries(result, entries)
    }
  }

  const output: JsonOutput = {
    version,
    encoding: options.encoding,
    timestamp: new Date().toISOString(),
    results: entries,
  }

  if (options.total || options.summarize) {
    output.total = results.reduce((sum, r) => sum + r.tokens, 0)
  }

  return JSON.stringify(output, null, 2)
}
