import { test, describe } from 'node:test'
import assert from 'node:assert'
import { formatText, formatJson } from '../src/formatter.ts'
import type { CliOptions, TokenResult } from '../src/types.ts'

function makeOptions (overrides: Partial<CliOptions> = {}): CliOptions {
  return {
    summarize: false,
    humanReadable: false,
    all: false,
    total: false,
    json: false,
    encoding: 'o200k_base',
    exclude: [],
    paths: ['.'],
    ...overrides,
  }
}

const sampleResults: TokenResult[] = [
  {
    path: 'src',
    tokens: 100,
    isFile: false,
    children: [
      { path: 'src/main.ts', tokens: 60, isFile: true },
      { path: 'src/util.ts', tokens: 40, isFile: true },
    ],
  },
]

describe('formatText', () => {
  test('default output shows directories only', () => {
    const output = formatText(sampleResults, makeOptions())
    assert.strictEqual(output, '100\tsrc')
  })

  test('--all shows files and directories', () => {
    const output = formatText(sampleResults, makeOptions({ all: true }))
    const lines = output.split('\n')
    assert.strictEqual(lines.length, 3)
    assert.ok(lines[0]?.includes('src/main.ts'))
    assert.ok(lines[1]?.includes('src/util.ts'))
    assert.ok(lines[2]?.includes('src'))
  })

  test('--summarize shows only top-level totals', () => {
    const output = formatText(sampleResults, makeOptions({ summarize: true }))
    assert.strictEqual(output, '100\tsrc')
  })

  test('--total appends grand total', () => {
    const output = formatText(sampleResults, makeOptions({ total: true }))
    const lines = output.split('\n')
    assert.ok(lines[lines.length - 1]?.includes('total'))
    assert.ok(lines[lines.length - 1]?.startsWith('100'))
  })

  test('--human-readable formats numbers', () => {
    const bigResults: TokenResult[] = [
      { path: 'big', tokens: 1500, isFile: false, children: [] },
    ]
    const output = formatText(bigResults, makeOptions({ humanReadable: true }))
    assert.strictEqual(output, '1.5K\tbig')
  })

  test('--human-readable formats millions', () => {
    const bigResults: TokenResult[] = [
      { path: 'huge', tokens: 2_500_000, isFile: false, children: [] },
    ]
    const output = formatText(bigResults, makeOptions({ humanReadable: true }))
    assert.strictEqual(output, '2.5M\thuge')
  })

  test('--human-readable shows exact for small numbers', () => {
    const smallResults: TokenResult[] = [
      { path: 'small', tokens: 42, isFile: false, children: [] },
    ]
    const output = formatText(smallResults, makeOptions({ humanReadable: true }))
    assert.strictEqual(output, '42\tsmall')
  })
})

describe('formatJson', () => {
  test('produces valid JSON', () => {
    const output = formatJson(sampleResults, makeOptions(), '0.0.1')
    const parsed = JSON.parse(output)
    assert.strictEqual(parsed.version, '0.0.1')
    assert.strictEqual(parsed.encoding, 'o200k_base')
    assert.ok(Array.isArray(parsed.results))
  })

  test('includes all entries in non-summarize mode', () => {
    const output = formatJson(sampleResults, makeOptions(), '0.0.1')
    const parsed = JSON.parse(output)
    assert.strictEqual(parsed.results.length, 3)
    assert.strictEqual(parsed.results[0].type, 'file')
    assert.strictEqual(parsed.results[2].type, 'directory')
  })

  test('--summarize produces only top-level entries', () => {
    const output = formatJson(sampleResults, makeOptions({ summarize: true }), '0.0.1')
    const parsed = JSON.parse(output)
    assert.strictEqual(parsed.results.length, 1)
    assert.strictEqual(parsed.total, 100)
  })

  test('--total includes total field', () => {
    const output = formatJson(sampleResults, makeOptions({ total: true }), '0.0.1')
    const parsed = JSON.parse(output)
    assert.strictEqual(parsed.total, 100)
  })

  test('directory entries include children paths', () => {
    const output = formatJson(sampleResults, makeOptions(), '0.0.1')
    const parsed = JSON.parse(output)
    const dirEntry = parsed.results.find((r: { type: string }) => r.type === 'directory')
    assert.ok(Array.isArray(dirEntry.children))
    assert.strictEqual(dirEntry.children.length, 2)
  })
})
