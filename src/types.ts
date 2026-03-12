export interface TokenResult {
  path: string
  tokens: number
  isFile: boolean
  children?: TokenResult[]
}

export interface CliOptions {
  summarize: boolean
  humanReadable: boolean
  all: boolean
  maxDepth?: number
  total: boolean
  json: boolean
  encoding: string
  model?: string
  exclude: string[]
  paths: string[]
}

export interface JsonOutputEntry {
  path: string
  tokens: number
  type: 'file' | 'directory'
  children?: string[]
}

export interface JsonOutput {
  version: string
  encoding: string
  timestamp: string
  results: JsonOutputEntry[]
  total?: number
}

export type TokenCountFn = (text: string) => number
