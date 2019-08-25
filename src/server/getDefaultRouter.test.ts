import { debugResource } from '../test/debug.resource'
import { resourceTestService } from '../test/resource.test.service'

test('should handle async error', async () => {
  const app = resourceTestService.createAppWithResource(debugResource)
  const { status, body } = await app.get('/asyncError')
  // console.log(status, body)
  expect(status).toBe(500)
  expect(body).toHaveProperty('error')
  expect(body.error).toMatchSnapshot()
})
