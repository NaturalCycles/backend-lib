import {
  _anyToError,
  _errorToErrorObject,
  _filterUndefinedValues,
  HttpError,
  HttpErrorData,
  HttpErrorResponse,
} from '@naturalcycles/js-lib'
import { inspectAnyStringifyFn } from '@naturalcycles/nodejs-lib'
import { ErrorRequestHandler, Response } from 'express'
import { SentrySharedService } from '../../sentry/sentry.shared.service'
import { RequestWithLog } from './createGaeLogMiddleware'

export interface GenericErrorHandlerCfg {
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
export function genericErrorHandler(cfg: GenericErrorHandlerCfg = {}): ErrorRequestHandler {
  sentryService ||= cfg.sentryService

  return (err, req: RequestWithLog, res, _next) => {
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
export function respondWithError(req: RequestWithLog, res: Response, err: any): void {
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
  // Only report 5xx
  return (
    (err as HttpError)?.data?.report ||
    !(err as HttpError)?.data ||
    (err as HttpError).data.httpStatusCode >= 500
  )
}
