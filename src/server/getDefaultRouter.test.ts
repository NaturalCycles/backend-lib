import { debugResource } from '../test/debug.resource'
import { CloseableGot, expressTestService } from '../testing'

// This is too easy:
// const app = expressTestService.getGot()
// const app = getGot().extend({
//   prefixUrl: process.env.__EXPRESS_SERVER_URL__,
// })

let app: CloseableGot
beforeAll(async () => {
  app = await expressTestService.getGot([debugResource])
})
afterAll(async () => {
  await app.close()
})

test('root resource ok', async () => {
  const r = await app('').json()
  expect(r).toEqual({ ok: 1 })
})

test('should handle async error', async () => {
  const err = await app('asyncError', { throwHttpErrors: false }).json()
  expect(err).toMatchSnapshot()
})
