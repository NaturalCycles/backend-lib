import {
  _anyToError,
  _errorToErrorObject,
  _filterUndefinedValues,
  ErrorObject,
  HttpError,
  HttpErrorData,
  HttpErrorResponse,
} from '@naturalcycles/js-lib'
import { inspectAnyStringifyFn } from '@naturalcycles/nodejs-lib'
import { SentrySharedService } from '../sentry/sentry.shared.service'
import { BackendErrorRequestHandler, BackendRequest, BackendResponse } from './server.model'

export interface GenericErrorMiddlewareCfg {
  sentryService?: SentrySharedService

  /**
   * Defaults to false.
   * So, by default, it will report ALL errors, not only 5xx.
   */
  reportOnly5xx?: boolean

  /**
   * Generic hook that can be used to **mutate** errors before they are returned to client.
   * This function does not affect data sent to sentry.
   */
  formatError?: (err: ErrorObject<HttpErrorData>) => void
}

const { APP_ENV } = process.env
const includeErrorStack = APP_ENV !== 'prod' && APP_ENV !== 'test'

// Hacky way to store the sentryService, so it's available to `respondWithError` function
let sentryService: SentrySharedService | undefined
let reportOnly5xx = false
let formatError: GenericErrorMiddlewareCfg['formatError']

/**
 * Generic error handler.
 * Returns HTTP code based on err.data.httpStatusCode (default to 500).
 * Sends json payload as ErrorResponse, transformed via errorSharedUtil.
 */
export function genericErrorMiddleware(
  cfg: GenericErrorMiddlewareCfg = {},
): BackendErrorRequestHandler {
  sentryService ||= cfg.sentryService
  reportOnly5xx = cfg.reportOnly5xx || false
  formatError = cfg.formatError

  return (err, req, res, _next) => {
    // if (res.headersSent) {
    // Here we don't even log this error
    // It's known that it comes from sentry.requestHandler()
    // requestHandler waits for all promises/timeouts to finish in the request, and then emits this error here,
    // while `res` is the same as was returned to the User (so, both headers and the data was already returned by that time)
    // req.log.warn(`genericErrorHandler, but headersSent=true`, err)
    // Here we don't propagate the error further, cause there's only "default express error logger" behind it
    // and nothing else. Previously it was logging the same error once again because of this. Avoid.
    // return next(err)
    // return next()
    // }

    respondWithError(req, res, err)
  }
}

export function respondWithError(req: BackendRequest, res: BackendResponse, err: any): void {
  const { headersSent } = res

  if (headersSent) {
    req.error(`after headersSent`, err)
  } else {
    req.error(err)
  }

  const originalError = _anyToError(
    err,
    Error,
    {},
    {
      stringifyFn: inspectAnyStringifyFn,
    },
  )

  let errorId: string | undefined

  if (sentryService && shouldReportToSentry(originalError)) {
    errorId = sentryService.captureException(originalError, false)
  }

  if (res.headersSent) return

  const httpError = _errorToErrorObject<HttpErrorData>(originalError, includeErrorStack)

  httpError.data.errorId = errorId
  httpError.data.httpStatusCode ||= 500 // default to 500
  httpError.data.headersSent = headersSent || undefined
  httpError.data.report ||= undefined // set to undefined if false
  _filterUndefinedValues(httpError.data, true)

  formatError?.(httpError) // Mutates

  res.status(httpError.data.httpStatusCode).json({
    error: httpError,
  } as HttpErrorResponse)
}

function shouldReportToSentry(err: Error): boolean {
  const e = err as HttpError

  // By default - report
  if (!e?.data) return true

  // If `report` is set - do as it says
  if (e.data.report === true) return true
  if (e.data.report === false) return false

  // Report if http 5xx, otherwise not
  // If no httpCode - report
  // if httpCode >= 500 - report
  // Otherwise - report, unless !reportOnly5xx is set
  return !reportOnly5xx || !e.data.httpStatusCode || e.data.httpStatusCode >= 500
}
