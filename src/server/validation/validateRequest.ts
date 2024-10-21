import { _get, AppError } from '@naturalcycles/js-lib'
import { AnySchema, getValidationResult, JoiValidationError } from '@naturalcycles/nodejs-lib'
import { BackendRequest } from '../server.model'

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

/**
 * Mutates error
 */
function redact(redactPaths: string[], obj: any, error: Error): void {
  redactPaths
    .map(path => _get(obj, path) as string)
    .filter(Boolean)
    .forEach(secret => {
      error.message = error.message.replaceAll(secret, REDACTED)
    })
}

class ValidateRequest {
  body<T>(
    req: BackendRequest,
    schema: AnySchema<T>,
    opt: ReqValidationOptions<JoiValidationError> = {},
  ): T {
    return this.validate(req, 'body', schema, opt)
  }

  query<T>(
    req: BackendRequest,
    schema: AnySchema<T>,
    opt: ReqValidationOptions<JoiValidationError> = {},
  ): T {
    return this.validate(req, 'query', schema, opt)
  }

  params<T>(
    req: BackendRequest,
    schema: AnySchema<T>,
    opt: ReqValidationOptions<JoiValidationError> = {},
  ): T {
    return this.validate(req, 'params', schema, opt)
  }

  headers<T>(
    req: BackendRequest,
    schema: AnySchema<T>,
    opt: ReqValidationOptions<JoiValidationError> = {},
  ): T {
    return this.validate(req, 'headers', schema, opt)
  }

  private validate<T>(
    req: BackendRequest,
    reqProperty: 'body' | 'params' | 'query' | 'headers',
    schema: AnySchema<T>,
    opt: ReqValidationOptions<JoiValidationError> = {},
  ): T {
    const { value, error } = getValidationResult(req[reqProperty], schema, `request ${reqProperty}`)
    if (error) {
      let report: boolean | undefined
      if (typeof opt.report === 'boolean') {
        report = opt.report
      } else if (typeof opt.report === 'function') {
        report = opt.report(error)
      }

      if (opt.redactPaths) {
        redact(opt.redactPaths, req[reqProperty], error)
        error.data.joiValidationErrorItems.length = 0 // clears the array
        delete error.data.annotation
      }

      throw new AppError(error.message, {
        backendResponseStatusCode: 400,
        report,
        ...error.data,
      })
    }

    // mutate req to replace the property with the value, converted by Joi
    req[reqProperty] = value
    return value
  }
}

export const validateRequest = new ValidateRequest()
