import { isGAE } from './appEngine.util'

test('isGae', () => {
  expect(isGAE()).toBe(false)
})
