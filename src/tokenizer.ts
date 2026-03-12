import type { TokenCountFn } from './types.ts'

const VALID_ENCODINGS = new Set([
  'o200k_base',
  'o200k_harmony',
  'cl100k_base',
  'p50k_base',
  'p50k_edit',
  'r50k_base',
])

export function resolveEncoding (encoding?: string, model?: string): string {
  if (encoding && model) {
    throw new Error('Cannot specify both --encoding and --model')
  }
  if (encoding) {
    if (!VALID_ENCODINGS.has(encoding)) {
      throw new Error(`Unknown encoding: ${encoding}. Valid encodings: ${[...VALID_ENCODINGS].join(', ')}`)
    }
    return encoding
  }
  return 'o200k_base'
}

export async function getTokenCounter (encoding?: string, model?: string): Promise<TokenCountFn> {
  if (model) {
    if (encoding) {
      throw new Error('Cannot specify both --encoding and --model')
    }
    const mod = await import(`gpt-tokenizer/model/${model}`) as { countTokens: TokenCountFn }
    return mod.countTokens
  }

  const resolvedEncoding = resolveEncoding(encoding)
  if (resolvedEncoding === 'o200k_base') {
    const { countTokens } = await import('gpt-tokenizer')
    return countTokens
  }

  const mod = await import(`gpt-tokenizer/encoding/${resolvedEncoding}`) as { countTokens: TokenCountFn }
  return mod.countTokens
}
