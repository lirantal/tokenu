import { test, describe } from 'node:test'
import assert from 'node:assert'
import { resolve } from 'node:path'
import { countTokens } from 'gpt-tokenizer'
import { countFileTokens, walkPath } from '../src/walker.ts'

const FIXTURES = resolve(import.meta.dirname, 'fixtures')

describe('countFileTokens', () => {
  test('counts tokens in a text file', async () => {
    const tokens = await countFileTokens(resolve(FIXTURES, 'simple/hello.txt'), countTokens)
    assert.strictEqual(tokens, 4)
  })

  test('returns 0 for an empty file', async () => {
    const tokens = await countFileTokens(resolve(FIXTURES, 'empty/empty.txt'), countTokens)
    assert.strictEqual(tokens, 0)
  })

  test('returns 0 for a binary file', async () => {
    const tokens = await countFileTokens(resolve(FIXTURES, 'binary/image.bin'), countTokens)
    assert.strictEqual(tokens, 0)
  })
})

describe('walkPath', () => {
  const defaultOptions = {
    countFn: countTokens,
    all: true,
    exclude: [],
  }

  test('walks a simple directory', async () => {
    const result = await walkPath(
      resolve(FIXTURES, 'simple'),
      FIXTURES,
      defaultOptions
    )
    assert.strictEqual(result.isFile, false)
    assert.strictEqual(result.path, 'simple')
    assert.strictEqual(result.tokens, 13)
    assert.ok(result.children)
    assert.strictEqual(result.children.length, 2)
  })

  test('counts a single file', async () => {
    const result = await walkPath(
      resolve(FIXTURES, 'simple/hello.txt'),
      resolve(FIXTURES, 'simple'),
      defaultOptions
    )
    assert.strictEqual(result.isFile, true)
    assert.strictEqual(result.tokens, 4)
  })

  test('respects max-depth', async () => {
    const result = await walkPath(
      resolve(FIXTURES, 'simple'),
      FIXTURES,
      { ...defaultOptions, maxDepth: 0 }
    )
    assert.strictEqual(result.tokens, 4)
    assert.ok(result.children)
    const hasSubdir = result.children.some(c => c.path === 'simple/subdir')
    assert.strictEqual(hasSubdir, false)
  })

  test('respects exclude patterns', async () => {
    const result = await walkPath(
      resolve(FIXTURES, 'mixed'),
      FIXTURES,
      { ...defaultOptions, exclude: ['*.json'] }
    )
    const jsonChild = result.children?.find(c => c.path.endsWith('.json'))
    assert.strictEqual(jsonChild, undefined)
    assert.strictEqual(result.tokens, 34)
  })

  test('handles empty directory with empty file', async () => {
    const result = await walkPath(
      resolve(FIXTURES, 'empty'),
      FIXTURES,
      defaultOptions
    )
    assert.strictEqual(result.tokens, 0)
  })

  test('skips binary files', async () => {
    const result = await walkPath(
      resolve(FIXTURES, 'binary'),
      FIXTURES,
      defaultOptions
    )
    assert.strictEqual(result.tokens, 0)
  })
})
