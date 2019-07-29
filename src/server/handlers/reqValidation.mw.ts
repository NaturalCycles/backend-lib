import { AnySchema } from '@hapi/joi'
import { HttpError } from '@naturalcycles/js-lib'
import { getValidationResult } from '@naturalcycles/nodejs-lib'
import { RequestHandler } from 'express'

export function reqValidation (
  reqProperty: 'body' | 'params' | 'query',
  schema: AnySchema,
): RequestHandler {
  return (req, res, next) => {
    const { value, error } = getValidationResult(req[reqProperty], schema, `req.${reqProperty}`)
    if (error) {
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
