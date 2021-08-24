import { inspectAny } from '@naturalcycles/nodejs-lib'
import { debugResource } from '../../test/debug.resource'
import { expressTestService } from '../../testing'

const app = expressTestService.createApp([debugResource])
afterAll(async () => {
  await app.close()
})

test('reqValidation', async () => {
  // should pass (no error)
  await app
    .put('changePassword', {
      json: {
        pw: 'longEnough',
      },
    })
    .json()

  const pw = 'short'
  const { body, statusCode } = await app.put('changePassword', {
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
      "httpStatusCode": 400,
      "joiValidationErrorItems": Array [],
      "joiValidationObjectName": "request body",
    },
    "message": "Invalid request body
{
  \\"pw\\" [1]: \\"REDACTED\\"
}

[1] \\"pw\\" length must be at least 8 characters long",
    "name": "HttpError",
  },
}
`)

  expect(inspectAny(body)).toMatchInlineSnapshot(`
"HttpError(400): Invalid request body
{
  \\"pw\\" [1]: \\"REDACTED\\"
}

[1] \\"pw\\" length must be at least 8 characters long"
`)
})
