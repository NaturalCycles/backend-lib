import { debugResource } from '../test/debug.resource'
import { CloseableGot, expressTestService } from '../testing/express.test.service'

let app: CloseableGot
beforeAll(async () => {
  app = await expressTestService.createAppWithResources([debugResource])
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

// Alternative approach:
// test('root resource ok', async () => {
//   await resourceTestService.createAppWithResources([debugResource], {}, async app => {
//     const r = await app('').json()
//     expect(r).toEqual({ok: 1})
//   })
// })
