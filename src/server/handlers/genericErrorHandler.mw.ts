import {
  _anyToErrorObject,
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

  const error = _anyToErrorObject<HttpErrorData>(err, {
    stringifyFn: inspectAnyStringifyFn,
    includeErrorStack,
    includeErrorData: true,
  }) as HttpError

  error.data.httpStatusCode ||= 500 // default to 500
  error.data.headersSent = headersSent || undefined
  error.data.report ||= undefined // set to undefined if false
  _filterUndefinedValues(error.data, true)

  if (sentryService && shouldReportToSentry(error)) {
    error.data.errorId = sentryService.captureException(error, false)
  }

  if (res.headersSent) return

  res.status(error.data.httpStatusCode).json({
    error,
  } as HttpErrorResponse)
}

function shouldReportToSentry(err: HttpError): boolean {
  // Only report 5xx
  return err.data.report || err.data.httpStatusCode >= 500
}
