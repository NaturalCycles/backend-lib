import { debugResource } from '../test/debug.resource'
import { expressTestService } from '../testing'

// This is too easy:
// const app = expressTestService.getGot()
// const app = getGot().extend({
//   prefixUrl: process.env.__EXPRESS_SERVER_URL__,
// })

const app = expressTestService.createApp([debugResource])
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
