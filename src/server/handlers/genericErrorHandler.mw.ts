import { Debug } from '@naturalcycles/nodejs-lib'
import { ErrorRequestHandler } from 'express'
import { respondWithError } from '../error.util'

const log = Debug('nc:backend-lib')

/**
 * Generic error handler.
 * Returns HTTP code based on err.data.httpStatusCode (default to 500).
 * Sends json payload as ErrorResponse, transformed via errorSharedUtil.
 */
export function genericErrorHandler(): ErrorRequestHandler {
  return (_err, req, res, next) => {
    if (res.headersSent) {
      log(`genericErrorHandler, but headersSent=true`, _err)
      return next(_err)
    }
    log.error(_err)

    respondWithError(req, res, _err)
  }
}
