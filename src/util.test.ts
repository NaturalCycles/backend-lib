import { expect, test } from 'vitest'
import { isCloudRun, isGAE } from './util'

test('isGAE', () => {
  expect(isGAE()).toBe(false)
})

test('isCloudRun', () => {
  expect(isCloudRun()).toBe(false)
})
