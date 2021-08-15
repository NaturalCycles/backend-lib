import { HttpError, JsonSchema, _get } from '@naturalcycles/js-lib'
import { AjvSchema } from '@naturalcycles/nodejs-lib'
import { RequestHandler } from 'express'
import { ReqValidationOptions } from './reqValidation.mw'

const REDACTED = 'REDACTED'

export function validateBody(
  schema: AjvSchema | JsonSchema,
  opt: ReqValidationOptions = {},
): RequestHandler {
  return validateObject('body', schema, opt)
}

export function validateParams(
  schema: AjvSchema | JsonSchema,
  opt: ReqValidationOptions = {},
): RequestHandler {
  return validateObject('params', schema, opt)
}

export function validateQuery(
  schema: AjvSchema | JsonSchema,
  opt: ReqValidationOptions = {},
): RequestHandler {
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
  schema: AjvSchema | JsonSchema,
  opt: ReqValidationOptions = {},
): RequestHandler {
  const ajvSchema =
    schema instanceof AjvSchema
      ? schema
      : new AjvSchema(schema, {
          objectName: prop,
        })

  return (req, res, next) => {
    const error = ajvSchema.getValidationError(req[prop])
    if (error) {
      if (opt.redactPaths) {
        redact(opt.redactPaths, req[prop], error)
        error.data.errors.length = 0 // clears the array
      }

      return next(
        new HttpError(error.message, {
          httpStatusCode: 400,
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
