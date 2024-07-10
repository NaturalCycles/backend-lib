import { debugResource } from '../../test/debug.resource'
import { expressTestService } from '../../testing'

const app = expressTestService.createAppFromResource(debugResource)
afterAll(async () => {
  await app.close()
})

test('validateBody', async () => {
  // should pass (no error)
  await app.put('changePassword2', {
    json: {
      pw: 'longEnough',
    },
  })

  const pw = 'short'
  const err = await app.expectError({
    url: 'changePassword2',
    method: 'PUT',
    json: {
      pw,
    },
  })
  expect(err.data.responseStatusCode).toBe(400)
  expect(err.cause.message).not.toContain(pw)
  expect(err.cause.message).toContain('REDACTED')
  expect(err.cause).toMatchInlineSnapshot(`
{
  "data": {
    "backendResponseStatusCode": 400,
    "errors": [],
    "objectName": "request body",
    "userFriendly": true,
  },
  "message": "request body/pw must NOT have fewer than 8 characters
Input: { pw: 'REDACTED' }",
  "name": "AppError",
}
`)
})
