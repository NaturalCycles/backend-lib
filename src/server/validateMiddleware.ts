import { HttpError, JsonSchema, JsonSchemaBuilder, _get } from '@naturalcycles/js-lib'
import { AjvSchema, AjvValidationError } from '@naturalcycles/nodejs-lib'
import { BackendRequestHandler } from './server.model'
import { ReqValidationOptions } from './reqValidationMiddleware'

const REDACTED = 'REDACTED'

export function validateBody(
  schema: JsonSchema | JsonSchemaBuilder | AjvSchema,
  opt: ReqValidationOptions<AjvValidationError> = {},
): BackendRequestHandler {
  return validateObject('body', schema, opt)
}

export function validateParams(
  schema: JsonSchema | JsonSchemaBuilder | AjvSchema,
  opt: ReqValidationOptions<AjvValidationError> = {},
): BackendRequestHandler {
  return validateObject('params', schema, opt)
}

export function validateQuery(
  schema: JsonSchema | JsonSchemaBuilder | AjvSchema,
  opt: ReqValidationOptions<AjvValidationError> = {},
): BackendRequestHandler {
  return validateObject('query', schema, opt)
}

/**
 * Validates req property (body, params or query).
 * Supports Joi schema or AjvSchema (from nodejs-lib).
 * Able to redact sensitive data from the error message.
 * Throws http 400 on error.
 */
function validateObject(
  prop: 'body' | 'params' | 'query',
  schema: JsonSchema | JsonSchemaBuilder | AjvSchema,
  opt: ReqValidationOptions<AjvValidationError> = {},
): BackendRequestHandler {
  const ajvSchema = AjvSchema.create(schema, {
    objectName: `request ${prop}`,
  })

  const reportPredicate = typeof opt.report === 'function' ? opt.report : () => !!opt.report

  return (req, res, next) => {
    const error = ajvSchema.getValidationError(req[prop])
    if (error) {
      const report = reportPredicate(error)

      if (opt.redactPaths) {
        redact(opt.redactPaths, req[prop], error)
        error.data.errors.length = 0 // clears the array
      }

      return next(
        new HttpError(error.message, {
          httpStatusCode: 400,
          report,
          ...error.data,
        }),
      )
    }

    next()
  }
}

/**
 * Mutates error
 */
function redact(redactPaths: string[], obj: any, error: Error): void {
  redactPaths
    .map(path => _get(obj, path))
    .filter(Boolean)
    .forEach(secret => {
      if (secret) {
        error.message = error.message.replace(secret, REDACTED)
      }
    })
}
