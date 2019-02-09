import { Error400 } from './error400'

test('should match snapshot', () => {
  const err = new Error400('oops')
  expect(err.name).toBe('Error400')
  expect(err.message).toBe('oops')
  expect(err.stack).toContain('Error400')
  expect(err.data).toEqual({
    httpStatusCode: 400,
  })
})
