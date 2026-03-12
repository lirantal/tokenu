import { test, describe } from 'node:test'
import assert from 'node:assert'
import { resolve } from 'node:path'
import { walkAndCount } from '../src/main.ts'

const FIXTURES = resolve(import.meta.dirname, 'fixtures')

describe('walkAndCount (public API)', () => {
  test('counts tokens in a directory', async () => {
    const results = await walkAndCount(
      [resolve(FIXTURES, 'simple')],
      { all: true, encoding: 'o200k_base', exclude: [] }
    )
    assert.strictEqual(results.length, 1)
    const result = results[0]
    assert.ok(result)
    assert.strictEqual(result.tokens, 13)
    assert.strictEqual(result.isFile, false)
  })

  test('counts tokens in a single file', async () => {
    const results = await walkAndCount(
      [resolve(FIXTURES, 'simple/hello.txt')],
      { all: true, encoding: 'o200k_base', exclude: [] }
    )
    assert.strictEqual(results.length, 1)
    const result = results[0]
    assert.ok(result)
    assert.strictEqual(result.tokens, 4)
    assert.strictEqual(result.isFile, true)
  })

  test('handles multiple paths', async () => {
    const results = await walkAndCount(
      [resolve(FIXTURES, 'simple'), resolve(FIXTURES, 'mixed')],
      { all: true, encoding: 'o200k_base', exclude: [] }
    )
    assert.strictEqual(results.length, 2)
    assert.strictEqual(results[0]?.tokens, 13)
    assert.strictEqual(results[1]?.tokens, 46)
  })

  test('respects encoding option', async () => {
    const results = await walkAndCount(
      [resolve(FIXTURES, 'simple/hello.txt')],
      { all: true, encoding: 'cl100k_base', exclude: [] }
    )
    assert.strictEqual(results.length, 1)
    const result = results[0]
    assert.ok(result)
    assert.ok(result.tokens > 0)
  })
})
