import {
  _anyToError,
  _errorToErrorObject,
  _filterUndefinedValues,
  HttpError,
  HttpErrorData,
  HttpErrorResponse,
} from '@naturalcycles/js-lib'
import { inspectAnyStringifyFn } from '@naturalcycles/nodejs-lib'
import { SentrySharedService } from '../sentry/sentry.shared.service'
import { BackendErrorRequestHandler, BackendRequest, BackendResponse } from './server.model'

export interface GenericErrorMiddlewareCfg {
  sentryService?: SentrySharedService
}

const { APP_ENV } = process.env
const includeErrorStack = APP_ENV !== 'prod' && APP_ENV !== 'test'

// Hacky way to store the sentryService, so it's available to `respondWithError` function
let sentryService: SentrySharedService | undefined

/**
 * Generic error handler.
 * Returns HTTP code based on err.data.httpStatusCode (default to 500).
 * Sends json payload as ErrorResponse, transformed via errorSharedUtil.
 */
export function genericErrorMiddleware(
  cfg: GenericErrorMiddlewareCfg = {},
): BackendErrorRequestHandler {
  sentryService ||= cfg.sentryService

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

// export interface ResponseWithError extends Response {
//   __err?: any
// }
export function respondWithError(req: BackendRequest, res: BackendResponse, err: any): void {
  const { headersSent } = res

  req.error(`genericErrorHandler${headersSent ? ' after headersSent' : ''}:\n`, err)

  const originalError = _anyToError(err, Error, {
    stringifyFn: inspectAnyStringifyFn,
  })

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
  return !e.data.httpStatusCode || e.data.httpStatusCode >= 500
}
