import { getValidationResult } from '@naturalcycles/nodejs-lib'
import { RequestHandler } from 'express'
import { AnySchema } from 'joi'
import { Error400 } from '../..'

export function reqValidationMiddleware (
  reqProperty: 'body' | 'params' | 'query',
  schema: AnySchema,
): RequestHandler {
  return (req, res, next) => {
    const { value, error } = getValidationResult(req[reqProperty], schema, `req.${reqProperty}`)
    if (error) {
      return next(new Error400(error.message, error.data))
    }

    // mutate req to replace the property with the value, converted by Joi
    req[reqProperty] = value
    next()
  }
}
