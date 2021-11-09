import { _anyToErrorObject, HttpErrorData, HttpErrorResponse } from '@naturalcycles/js-lib'
import { ErrorRequestHandler, Request, Response } from 'express'

const { APP_ENV } = process.env
const includeErrorStack = APP_ENV !== 'prod' && APP_ENV !== 'test'

/**
 * Generic error handler.
 * Returns HTTP code based on err.data.httpStatusCode (default to 500).
 * Sends json payload as ErrorResponse, transformed via errorSharedUtil.
 */
export function genericErrorHandler(): ErrorRequestHandler {
  return (err, req, res, next) => {
    if (res.headersSent) {
      // Here we don't even log this error
      // It's known that it comes from sentry.requestHandler()
      // requestHandler waits for all promises/timeouts to finish in the request, and then emits this error here,
      // while `res` is the same as was returned to the User (so, both headers and the data was already returned by that time)
      // req.log.warn(`genericErrorHandler, but headersSent=true`, err)
      // Here we don't propagate the error further, cause there's only "default express error logger" behind it
      // and nothing else. Previously it was logging the same error once again because of this. Avoid.
      // return next(err)
      return next()
    }
    req.error('genericErrorHandler:', err)

    respondWithError(req, res, err)
  }
}

// export interface ResponseWithError extends Response {
//   __err?: any
// }
export function respondWithError(_req: Request, res: Response, err: any): void {
  // if (err) {
  //   // Attach error to response, so simpleRequestLogger can pick it up
  //   ;(res as ResponseWithError).__err = err
  // }

  const error = _anyToErrorObject<HttpErrorData>(err, {
    includeErrorStack,
    includeErrorData: true,
  })

  error.data.httpStatusCode ||= 500 // default to 500

  res.status(error.data.httpStatusCode).json({
    error,
  } as HttpErrorResponse)
}
