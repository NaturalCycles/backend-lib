import { expect, test } from 'vitest'
import { isGAE } from './appEngine.util'

test('isGae', () => {
  expect(isGAE()).toBe(false)
})
