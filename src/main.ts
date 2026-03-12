import { resolve } from 'node:path'
import type { CliOptions, TokenResult } from './types.ts'
import { getTokenCounter } from './tokenizer.ts'
import { walkPath } from './walker.ts'
export { countFileTokens } from './walker.ts'
export { getTokenCounter, resolveEncoding } from './tokenizer.ts'
export { formatText, formatJson } from './formatter.ts'
export type { TokenResult, CliOptions, TokenCountFn, JsonOutput, JsonOutputEntry } from './types.ts'

export async function walkAndCount (
  paths: string[],
  options: Omit<CliOptions, 'paths' | 'json' | 'humanReadable' | 'total' | 'summarize'>
): Promise<TokenResult[]> {
  const countFn = await getTokenCounter(options.encoding, options.model)
  const results: TokenResult[] = []

  for (const targetPath of paths) {
    const absPath = resolve(targetPath)
    const result = await walkPath(absPath, resolve(absPath, '..'), {
      countFn,
      all: options.all,
      maxDepth: options.maxDepth,
      exclude: options.exclude,
    })
    results.push(result)
  }

  return results
}
