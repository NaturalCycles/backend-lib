import { _get, AppError, ZodSchema, ZodValidationError, zSafeValidate } from '@naturalcycles/js-lib'
import { BackendRequestHandler } from '../server.model'
import { ReqValidationOptions } from './validateRequest'

const REDACTED = 'REDACTED'

/**
 * Validates req property (body, params or query).
 * Supports Joi schema or AjvSchema (from nodejs-lib).
 * Able to redact sensitive data from the error message.
 * Throws http 400 on error.
 */
export function zodReqValidate(
  prop: 'body' | 'params' | 'query',
  schema: ZodSchema,
  opt: ReqValidationOptions<ZodValidationError<any>> = {},
): BackendRequestHandler {
  const reportPredicate =
    typeof opt.report === 'function' ? opt.report : () => opt.report as boolean | undefined

  return (req, res, next) => {
    const { error } = zSafeValidate(req[prop], schema)
    if (!error) {
      return next()
    }

    const report = reportPredicate(error)

    if (opt.redactPaths) {
      redact(opt.redactPaths, req[prop], error)
    }

    return next(
      new AppError(error.message, {
        backendResponseStatusCode: 400,
        report,
      }),
    )
  }
}

/**
 * Mutates error
 */
function redact(redactPaths: string[], obj: any, error: Error): void {
  redactPaths
    .map(path => _get(obj, path) as string)
    .filter(Boolean)
    .forEach(secret => {
      error.message = error.message.replace(secret, REDACTED)
    })
}
