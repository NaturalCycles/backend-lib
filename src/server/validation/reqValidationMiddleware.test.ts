import { _inspect } from '@naturalcycles/nodejs-lib'
import { debugResource } from '../../test/debug.resource'
import { expressTestService } from '../../testing'

const app = expressTestService.createAppFromResource(debugResource)
afterAll(async () => {
  await app.close()
})

test('reqValidation', async () => {
  // should pass (no error)
  await app.put('changePassword', {
    json: {
      pw: 'longEnough',
    },
  })

  const pw = 'short'
  const err = await app.expectError({
    url: 'changePassword',
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
    "httpStatusCode": 400,
    "joiValidationErrorItems": [],
    "joiValidationObjectName": "request body",
  },
  "message": "Invalid request body
{
  "pw" [1]: "REDACTED"
}

[1] "pw" length must be at least 8 characters long",
  "name": "AppError",
}
`)

  expect(_inspect(err.cause)).toMatchInlineSnapshot(`
    "AppError: Invalid request body
    {
      "pw" [1]: "REDACTED"
    }

    [1] "pw" length must be at least 8 characters long"
  `)
})

test('validateRequest', async () => {
  // should pass (no error)
  await app.put('changePasswordFn', {
    json: {
      pw: 'longEnough',
    },
  })

  const pw = 'short'
  const err = await app.expectError({
    url: 'changePasswordFn',
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
    "httpStatusCode": 400,
    "joiValidationErrorItems": [],
    "joiValidationObjectName": "request body",
  },
  "message": "Invalid request body
{
  "pw" [1]: "REDACTED"
}

[1] "pw" length must be at least 8 characters long",
  "name": "AppError",
}
`)

  expect(_inspect(err.cause)).toMatchInlineSnapshot(`
    "AppError: Invalid request body
    {
      "pw" [1]: "REDACTED"
    }

    [1] "pw" length must be at least 8 characters long"
  `)
})
