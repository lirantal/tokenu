import { test, describe, beforeEach, mock } from 'node:test'
import assert from 'node:assert'
import { add } from '../src/main.ts'

describe('CLI program', () => {

  beforeEach(() => {
    // Reset the mocks before each test
    mock.reset()
  });

  test('Program sums two arguments', async (t) => {
    const result = await add(1, 1);
    assert.strictEqual(result, 2);
  })

});