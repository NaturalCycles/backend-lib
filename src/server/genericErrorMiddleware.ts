import {
  _anyToError,
  _errorLikeToErrorObject,
  _filterUndefinedValues,
  AppError,
  BackendErrorResponseObject,
  ErrorObject,
} from '@naturalcycles/js-lib'
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
  formatError?: (err: ErrorObject) => void
}

const { APP_ENV } = process.env
const includeErrorStack = APP_ENV === 'dev'

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

  const originalError = _anyToError(err)

  let errorId: string | undefined

  if (sentryService && shouldReportToSentry(originalError)) {
    errorId = sentryService.captureException(originalError, false)
  }

  if (res.headersSent) return

  const httpError = _errorLikeToErrorObject(originalError)
  if (!includeErrorStack) delete httpError.stack

  httpError.data.errorId = errorId
  httpError.data.backendResponseStatusCode ||= 500 // default to 500
  // httpStatusCode is for backwards-compatibility
  // Otherwise, it breaks the _isHttpErrorResponse function check, and error get formatted/detected wrongly
  httpError.data['httpStatusCode'] = httpError.data.backendResponseStatusCode
  httpError.data.headersSent = headersSent || undefined
  httpError.data.report ||= undefined // set to undefined if false
  _filterUndefinedValues(httpError.data, true)

  formatError?.(httpError) // Mutates

  res.status(httpError.data.backendResponseStatusCode).json({
    error: httpError,
  } satisfies BackendErrorResponseObject)
}

function shouldReportToSentry(err: Error): boolean {
  const e = err as AppError

  // By default - report
  if (!e?.data) return true

  // If `report` is set - do as it says
  if (e.data.report === true) return true
  if (e.data.report === false) return false

  // Report if http 5xx, otherwise not
  // If no httpCode - report
  // if httpCode >= 500 - report
  // Otherwise - report, unless !reportOnly5xx is set
  return (
    !reportOnly5xx || !e.data.backendResponseStatusCode || e.data.backendResponseStatusCode >= 500
  )
}
