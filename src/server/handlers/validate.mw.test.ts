import { debugResource } from '../../test/debug.resource'
import { expressTestService } from '../../testing'

const app = expressTestService.createApp([debugResource])
afterAll(async () => {
  await app.close()
})

test('validateBody', async () => {
  // should pass (no error)
  await app
    .put('changePassword', {
      json: {
        pw: 'longEnough',
      },
    })
    .json()

  const pw = 'short'
  const { body, statusCode } = await app.put('changePassword2', {
    json: {
      pw,
    },
    throwHttpErrors: false,
  })
  expect(statusCode).toBe(400)
  const bodyStr = JSON.stringify(body)
  expect(bodyStr).not.toContain(pw)
  expect(bodyStr).toContain('REDACTED')
  expect(body).toMatchInlineSnapshot(`
Object {
  "error": Object {
    "data": Object {
      "errors": Array [],
      "httpStatusCode": 400,
      "objectName": "body",
      "userFriendly": true,
    },
    "message": "body/pw must NOT have fewer than 8 characters
Input: {
  \\"pw\\": \\"REDACTED\\"
}",
  },
}
`)
})
