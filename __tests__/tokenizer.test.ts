import { test, describe } from 'node:test'
import assert from 'node:assert'
import { getTokenCounter, resolveEncoding } from '../src/tokenizer.ts'

describe('resolveEncoding', () => {
  test('returns o200k_base by default', () => {
    assert.strictEqual(resolveEncoding(), 'o200k_base')
  })

  test('returns the specified encoding', () => {
    assert.strictEqual(resolveEncoding('cl100k_base'), 'cl100k_base')
  })

  test('throws on unknown encoding', () => {
    assert.throws(() => resolveEncoding('invalid_encoding'), {
      message: /Unknown encoding: invalid_encoding/,
    })
  })

  test('throws when both encoding and model are specified', () => {
    assert.throws(() => resolveEncoding('cl100k_base', 'gpt-4o'), {
      message: /Cannot specify both/,
    })
  })
})

describe('getTokenCounter', () => {
  test('returns a function for default encoding', async () => {
    const countFn = await getTokenCounter()
    assert.strictEqual(typeof countFn, 'function')
    assert.strictEqual(countFn('Hello, world!'), 4)
  })

  test('returns a function for cl100k_base encoding', async () => {
    const countFn = await getTokenCounter('cl100k_base')
    assert.strictEqual(typeof countFn, 'function')
    const count = countFn('Hello, world!')
    assert.strictEqual(typeof count, 'number')
    assert.ok(count > 0)
  })

  test('returns a function for a model name', async () => {
    const countFn = await getTokenCounter(undefined, 'gpt-4o')
    assert.strictEqual(typeof countFn, 'function')
    assert.strictEqual(countFn('Hello, world!'), 4)
  })

  test('throws when both encoding and model are specified', async () => {
    await assert.rejects(
      () => getTokenCounter('cl100k_base', 'gpt-4o'),
      { message: /Cannot specify both/ }
    )
  })
})
