import { ErrorRequestHandler } from 'express'
import { respondWithError } from '../error.util'

/**
 * Generic error handler.
 * Returns HTTP code based on err.data.httpStatusCode (default to 500).
 * Sends json payload as ErrorResponse, transformed via errorSharedUtil.
 */
export function genericErrorHandler(): ErrorRequestHandler {
  return (err, req, res, next) => {
    if (res.headersSent) {
      console.warn(`genericErrorHandler, but headersSent=true`, err)
      return next(err)
    }
    console.error(err)

    respondWithError(req, res, err)
  }
}
