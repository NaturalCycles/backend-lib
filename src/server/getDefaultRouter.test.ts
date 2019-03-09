import { debugResource } from '../test/debug.resource'
import { resourceTestService } from '../testing/resource.test.service'

test('should handle async error', async () => {
  const app = resourceTestService.createAppWithResource(debugResource)
  const { status, body } = await app.get('/asyncError')
  // console.log(status, body)
  expect(status).toBe(500)
  expect(body).toHaveProperty('error')
  expect(body.error).toMatchSnapshot({
    stack: expect.stringContaining('Error: debug_async_error'),
  })
})
