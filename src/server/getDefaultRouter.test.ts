import { debugResource } from '../test/debug.resource'
import { expressTestService } from '../testing'

const app = expressTestService.createAppFromResource(debugResource)
afterAll(async () => {
  await app.close()
})

test('root resource ok', async () => {
  const r = await app('').json()
  expect(r).toEqual({ ok: 1 })
})

// This started to mysteriously fail after some Got upgrade
// todo: investigate!
test.skip('should handle async error', async () => {
  const err = await app('asyncError', { throwHttpErrors: false }).json()
  expect(err).toMatchSnapshot()
})
