import { readdir, readFile, stat } from 'node:fs/promises'
import { join, matchesGlob, relative, sep } from 'node:path'
import type { TokenCountFn, TokenResult } from './types.ts'

const DEFAULT_IGNORE = new Set([
  'node_modules',
  '.git',
])

const BINARY_CHECK_BYTES = 8192
const GITIGNORE_FILE = '.gitignore'

interface GitIgnoreRule {
  pattern: string
  negated: boolean
  directoryOnly: boolean
  anchored: boolean
  hasSlash: boolean
}

interface IgnoreContext {
  rootPath: string
  rules: GitIgnoreRule[]
}

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

function toPosixPath (value: string): string {
  return sep === '/' ? value : value.split(sep).join('/')
}

function parseGitIgnoreLine (rawLine: string): GitIgnoreRule | undefined {
  let pattern = rawLine.trim()
  if (pattern === '' || pattern.startsWith('#')) return undefined

  if (pattern.startsWith('\\#') || pattern.startsWith('\\!')) {
    pattern = pattern.slice(1)
  }

  let negated = false
  if (pattern.startsWith('!')) {
    negated = true
    pattern = pattern.slice(1)
  }

  pattern = pattern.trim()
  if (pattern === '') return undefined

  const anchored = pattern.startsWith('/')
  pattern = pattern.replace(/^\/+/, '')

  const directoryOnly = pattern.endsWith('/')
  pattern = pattern.replace(/\/+$/, '')
  if (pattern === '') return undefined

  return {
    pattern,
    negated,
    directoryOnly,
    anchored,
    hasSlash: pattern.includes('/'),
  }
}

function parseGitIgnore (content: string): GitIgnoreRule[] {
  const rules: GitIgnoreRule[] = []
  for (const line of content.split(/\r?\n/)) {
    const rule = parseGitIgnoreLine(line)
    if (rule) rules.push(rule)
  }
  return rules
}

async function loadGitIgnoreContext (targetPath: string): Promise<IgnoreContext | undefined> {
  try {
    const content = await readFile(join(targetPath, GITIGNORE_FILE), 'utf-8')
    const rules = parseGitIgnore(content)
    return rules.length > 0 ? { rootPath: targetPath, rules } : undefined
  } catch (err) {
    if (err instanceof Error && 'code' in err && err.code === 'ENOENT') {
      return undefined
    }
    throw err
  }
}

function matchesGitIgnorePattern (
  relativePath: string,
  basename: string,
  isDirectory: boolean,
  rule: GitIgnoreRule
): boolean {
  if (rule.directoryOnly && !isDirectory) return false

  if (!rule.anchored && !rule.hasSlash) {
    return matchesGlob(basename, rule.pattern)
  }

  if (matchesGlob(relativePath, rule.pattern)) return true

  if (isDirectory) {
    return matchesGlob(`${relativePath}/`, `${rule.pattern}/**`)
  }

  return false
}

function matchesGitIgnore (
  childPath: string,
  entryName: string,
  isDirectory: boolean,
  ignoreContexts: IgnoreContext[]
): boolean {
  let ignored = false

  for (const context of ignoreContexts) {
    const relativePath = toPosixPath(relative(context.rootPath, childPath))
    if (relativePath === '' || relativePath.startsWith('../')) continue

    for (const rule of context.rules) {
      if (matchesGitIgnorePattern(relativePath, entryName, isDirectory, rule)) {
        ignored = !rule.negated
      }
    }
  }

  return ignored
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
  smartIgnore?: boolean
}

export async function walkPath (
  targetPath: string,
  basePath: string,
  options: WalkOptions,
  currentDepth: number = 0,
  ignoreContexts: IgnoreContext[] = []
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
  const smartIgnore = options.smartIgnore ?? true
  const currentIgnoreContexts = smartIgnore
    ? [...ignoreContexts, ...await loadGitIgnoreContext(targetPath).then(context => context ? [context] : [])]
    : ignoreContexts

  for (const entry of entries) {
    const childPath = join(targetPath, entry.name)
    const isDirectory = entry.isDirectory()

    if (smartIgnore && DEFAULT_IGNORE.has(entry.name)) continue
    if (smartIgnore && matchesGitIgnore(childPath, entry.name, isDirectory, currentIgnoreContexts)) continue
    if (matchesExclude(entry.name, options.exclude)) continue

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
      const childResult = await walkPath(childPath, basePath, options, currentDepth + 1, currentIgnoreContexts)
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
