import { test, describe } from 'node:test'
import assert from 'node:assert'
import { execFile } from 'node:child_process'
import { resolve } from 'node:path'

const CLI_ENTRY = resolve(import.meta.dirname, '..', 'src', 'bin', 'cli.ts')
const FIXTURES = resolve(import.meta.dirname, 'fixtures')

function run (...args: string[]): Promise<{ stdout: string, stderr: string, code: number | null }> {
  return new Promise((resolve) => {
    execFile(
      process.execPath,
      ['--import', 'tsx', CLI_ENTRY, ...args],
      { timeout: 15_000 },
      (error, stdout, stderr) => {
        resolve({
          stdout: stdout.toString(),
          stderr: stderr.toString(),
          code: error ? error.code as unknown as number : 0,
        })
      }
    )
  })
}

describe('CLI integration tests', () => {
  test('--help prints usage information', async () => {
    const { stdout, code } = await run('--help')
    assert.strictEqual(code, 0)
    assert.ok(stdout.includes('Usage: tokenu'))
    assert.ok(stdout.includes('--summarize'))
    assert.ok(stdout.includes('--json'))
  })

  test('--version prints version number', async () => {
    const { stdout, code } = await run('--version')
    assert.strictEqual(code, 0)
    assert.match(stdout.trim(), /^\d+\.\d+\.\d+$/)
  })

  test('default output on simple fixture', async () => {
    const { stdout, code } = await run(resolve(FIXTURES, 'simple'))
    assert.strictEqual(code, 0)
    const lines = stdout.trim().split('\n')
    const lastLine = lines[lines.length - 1]
    assert.ok(lastLine)
    assert.ok(lastLine.includes('simple'))
    assert.ok(lastLine.startsWith('13\t'))
  })

  test('-a flag shows all files', async () => {
    const { stdout, code } = await run('-a', resolve(FIXTURES, 'simple'))
    assert.strictEqual(code, 0)
    assert.ok(stdout.includes('hello.txt'))
    assert.ok(stdout.includes('nested.txt'))
  })

  test('-s flag summarizes', async () => {
    const { stdout, code } = await run('-s', resolve(FIXTURES, 'simple'))
    assert.strictEqual(code, 0)
    const lines = stdout.trim().split('\n')
    assert.strictEqual(lines.length, 1)
    assert.ok(lines[0]?.startsWith('13\t'))
  })

  test('-hs flags combine human-readable and summarize', async () => {
    const { stdout, code } = await run('-hs', resolve(FIXTURES, 'simple'))
    assert.strictEqual(code, 0)
    const lines = stdout.trim().split('\n')
    assert.strictEqual(lines.length, 1)
    assert.ok(lines[0]?.includes('simple'))
  })

  test('-c flag produces grand total', async () => {
    const { stdout, code } = await run(
      '-c',
      resolve(FIXTURES, 'simple'),
      resolve(FIXTURES, 'mixed')
    )
    assert.strictEqual(code, 0)
    const lines = stdout.trim().split('\n')
    const lastLine = lines[lines.length - 1]
    assert.ok(lastLine)
    assert.ok(lastLine.includes('total'))
    assert.ok(lastLine.startsWith('59\t'))
  })

  test('-d 0 limits depth to top-level entry only', async () => {
    const { stdout, code } = await run('-d', '0', resolve(FIXTURES, 'simple'))
    assert.strictEqual(code, 0)
    const lines = stdout.trim().split('\n')
    assert.strictEqual(lines.length, 1)
    assert.ok(lines[0]?.includes('simple'))
    assert.ok(!stdout.includes('nested.txt'))
    assert.ok(!stdout.includes('subdir'))
  })

  test('--json produces valid JSON output', async () => {
    const { stdout, code } = await run('--json', resolve(FIXTURES, 'simple'))
    assert.strictEqual(code, 0)
    const parsed = JSON.parse(stdout)
    assert.strictEqual(parsed.encoding, 'o200k_base')
    assert.ok(Array.isArray(parsed.results))
    assert.ok(parsed.version)
    assert.ok(parsed.timestamp)
  })

  test('--json -s produces summarized JSON', async () => {
    const { stdout, code } = await run('--json', '-s', resolve(FIXTURES, 'simple'))
    assert.strictEqual(code, 0)
    const parsed = JSON.parse(stdout)
    assert.strictEqual(parsed.results.length, 1)
    assert.strictEqual(parsed.total, 13)
  })

  test('--encoding cl100k_base uses alternate encoding', async () => {
    const { stdout, code } = await run(
      '--json', '-s', '--encoding', 'cl100k_base',
      resolve(FIXTURES, 'simple')
    )
    assert.strictEqual(code, 0)
    const parsed = JSON.parse(stdout)
    assert.strictEqual(parsed.encoding, 'cl100k_base')
    assert.ok(parsed.results[0].tokens > 0)
  })

  test('--exclude filters files', async () => {
    const { stdout, code } = await run(
      '-a', '--exclude', '*.json',
      resolve(FIXTURES, 'mixed')
    )
    assert.strictEqual(code, 0)
    assert.ok(!stdout.includes('data.json'))
    assert.ok(stdout.includes('code.js'))
  })

  test('nonexistent path produces error', async () => {
    const { stderr, code } = await run('/nonexistent/path')
    assert.ok(code !== 0)
    assert.ok(stderr.includes('tokenu:'))
  })

  test('invalid max-depth produces error', async () => {
    const { stderr, code } = await run('-d', 'abc', '.')
    assert.ok(code !== 0)
    assert.ok(stderr.includes('invalid max depth'))
  })

  test('defaults to current directory when no path given', async () => {
    const { stdout, code } = await run('-s', resolve(FIXTURES, 'simple'))
    assert.strictEqual(code, 0)
    assert.ok(stdout.trim().length > 0)
    assert.ok(stdout.includes('simple'))
  })

  test('handles empty directory', async () => {
    const { stdout, code } = await run('-s', resolve(FIXTURES, 'empty'))
    assert.strictEqual(code, 0)
    assert.ok(stdout.startsWith('0\t'))
  })

  test('binary files are skipped (0 tokens)', async () => {
    const { stdout, code } = await run('-s', resolve(FIXTURES, 'binary'))
    assert.strictEqual(code, 0)
    assert.ok(stdout.startsWith('0\t'))
  })
})
