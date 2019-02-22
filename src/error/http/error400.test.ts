import { Error400 } from './error400'

const throwError400 = () => {
  throw new Error400('hello')
}
const throwError400Async = async () => {
  throw new Error400('hello')
}

test('should match snapshot', async () => {
  const err = new Error400('oops')
  expect(err.name).toBe('Error400')
  expect(err.message).toBe('oops')
  expect(err.stack).toContain('Error400')
  expect(err.data).toEqual({
    httpStatusCode: 400,
  })

  expect(throwError400).toThrowError(Error400)
  await expect(throwError400Async()).rejects.toThrowError(Error400)
})
