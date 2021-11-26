import { HttpError, _get } from '@naturalcycles/js-lib'
import { AnySchema, getValidationResult, JoiValidationError } from '@naturalcycles/nodejs-lib'
import { BackendRequestHandler } from './server.model'

const REDACTED = 'REDACTED'

export interface ReqValidationOptions<ERR extends Error> {
  /**
   * Pass a 'dot-paths' (e.g `pw`, or `input.pw`) that needs to be redacted from the output, in case of error.
   * Useful e.g to redact (prevent leaking) plaintext passwords in error messages.
   */
  redactPaths?: string[]

  /**
   * Set to true, or a function that returns true/false based on the error generated.
   * If true - `genericErrorHandler` will report it to errorReporter (aka Sentry).
   */
  report?: boolean | ((err: ERR) => boolean)
}

export function reqValidation(
  reqProperty: 'body' | 'params' | 'query',
  schema: AnySchema,
  opt: ReqValidationOptions<JoiValidationError> = {},
): BackendRequestHandler {
  const reportPredicate = typeof opt.report === 'function' ? opt.report : () => !!opt.report

  return (req, res, next) => {
    const { value, error } = getValidationResult(req[reqProperty], schema, `request ${reqProperty}`)
    if (error) {
      const report = reportPredicate(error)

      if (opt.redactPaths) {
        redact(opt.redactPaths, req[reqProperty], error)
        error.data.joiValidationErrorItems.length = 0 // clears the array
        delete error.data.annotation
      }

      return next(
        new HttpError(error.message, {
          httpStatusCode: 400,
          report,
          ...error.data,
        }),
      )
    }

    // mutate req to replace the property with the value, converted by Joi
    req[reqProperty] = value
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
