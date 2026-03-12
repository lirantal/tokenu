import { readdir, readFile, stat } from 'node:fs/promises'
import { join, relative } from 'node:path'
import type { TokenCountFn, TokenResult } from './types.ts'

const DEFAULT_IGNORE = new Set([
  'node_modules',
  '.git',
])

const BINARY_CHECK_BYTES = 8192

function isBinaryBuffer (buffer: Buffer): boolean {
  const length = Math.min(buffer.length, BINARY_CHECK_BYTES)
  for (let i = 0; i < length; i++) {
    if (buffer[i] === 0) return true
  }
  return false
}

function matchesExclude (name: string, excludePatterns: string[]): boolean {
  for (const pattern of excludePatterns) {
    if (pattern === name) return true
    if (pattern.startsWith('*.') && name.endsWith(pattern.slice(1))) return true
    if (pattern.endsWith('/*') && name === pattern.slice(0, -2)) return true
  }
  return false
}

export async function countFileTokens (
  filePath: string,
  countFn: TokenCountFn
): Promise<number> {
  const buffer = await readFile(filePath)
  if (buffer.length === 0) return 0
  if (isBinaryBuffer(buffer)) return 0
  const text = buffer.toString('utf-8')
  try {
    return countFn(text)
  } catch {
    return 0
  }
}

export interface WalkOptions {
  countFn: TokenCountFn
  all: boolean
  maxDepth?: number
  exclude: string[]
}

export async function walkPath (
  targetPath: string,
  basePath: string,
  options: WalkOptions,
  currentDepth: number = 0
): Promise<TokenResult> {
  const info = await stat(targetPath)

  if (info.isFile()) {
    const tokens = await countFileTokens(targetPath, options.countFn)
    return {
      path: relative(basePath, targetPath) || targetPath,
      tokens,
      isFile: true,
    }
  }

  if (!info.isDirectory()) {
    return { path: relative(basePath, targetPath) || targetPath, tokens: 0, isFile: false }
  }

  const entries = await readdir(targetPath, { withFileTypes: true })
  const children: TokenResult[] = []
  let totalTokens = 0

  for (const entry of entries) {
    if (DEFAULT_IGNORE.has(entry.name)) continue
    if (matchesExclude(entry.name, options.exclude)) continue

    const childPath = join(targetPath, entry.name)

    if (entry.isFile()) {
      const tokens = await countFileTokens(childPath, options.countFn)
      totalTokens += tokens
      children.push({
        path: relative(basePath, childPath),
        tokens,
        isFile: true,
      })
    } else if (entry.isDirectory()) {
      if (options.maxDepth !== undefined && currentDepth >= options.maxDepth) {
        continue
      }
      const childResult = await walkPath(childPath, basePath, options, currentDepth + 1)
      totalTokens += childResult.tokens
      children.push(childResult)
    }
  }

  children.sort((a, b) => a.path.localeCompare(b.path))

  return {
    path: relative(basePath, targetPath) || targetPath,
    tokens: totalTokens,
    isFile: false,
    children,
  }
}
