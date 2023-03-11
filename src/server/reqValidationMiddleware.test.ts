import { inspectAny } from '@naturalcycles/nodejs-lib'
import { debugResource } from '../test/debug.resource'
import { expressTestService } from '../testing'

const app = expressTestService.createAppFromResource(debugResource)
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
    {
      "error": {
        "data": {
          "backendResponseStatusCode": 400,
          "joiValidationErrorItems": [],
          "joiValidationObjectName": "request body",
        },
        "message": "Invalid request body
    {
      "pw" [1]: "REDACTED"
    }

    [1] "pw" length must be at least 8 characters long",
        "name": "AppError",
      },
    }
  `)

  expect(inspectAny(body)).toMatchInlineSnapshot(`
    "AppError: Invalid request body
    {
      "pw" [1]: "REDACTED"
    }

    [1] "pw" length must be at least 8 characters long"
  `)
})
