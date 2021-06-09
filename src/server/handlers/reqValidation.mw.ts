import { HttpError, _get } from '@naturalcycles/js-lib'
import { AnySchema, getValidationResult } from '@naturalcycles/nodejs-lib'
import { RequestHandler } from 'express'

const REDACTED = 'REDACTED'

export interface ReqValidationOptions {
  /**
   * Pass a 'dot-paths' (e.g `pw`, or `input.pw`) that needs to be redacted from the output, in case of error.
   * Useful e.g to redact (prevent leaking) plaintext passwords in error messages.
   */
  redactPaths?: string[]
}

export function reqValidation(
  reqProperty: 'body' | 'params' | 'query',
  schema: AnySchema,
  opt: ReqValidationOptions = {},
): RequestHandler {
  return (req, res, next) => {
    const { value, error } = getValidationResult(req[reqProperty], schema, `req.${reqProperty}`)
    if (error) {
      if (opt.redactPaths) {
        opt.redactPaths
          .map(path => _get(req[reqProperty], path))
          .filter(Boolean)
          .forEach(secret => {
            if (secret) {
              error.message = error.message.replace(secret, REDACTED)
            }
          })

        error.data.joiValidationErrorItems.length = 0 // clears the array
      }

      return next(
        new HttpError(error.message, {
          httpStatusCode: 400,
          ...error.data,
        }),
      )
    }

    // mutate req to replace the property with the value, converted by Joi
    req[reqProperty] = value
    next()
  }
}
