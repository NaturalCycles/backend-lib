import {
  anyToErrorObject,
  ErrorObject,
  HttpErrorData,
  HttpErrorResponse,
} from '@naturalcycles/js-lib'
import { ErrorRequestHandler } from 'express'

const { APP_ENV } = process.env

/**
 * Generic error handler.
 * Returns HTTP code based on err.data.httpStatusCode (default to 500).
 * Sends json payload as ErrorResponse, transformed via errorSharedUtil.
 */
export const genericErrorHandler: ErrorRequestHandler = (_err, req, res, next) => {
  if (res.headersSent) return next(_err)
  // log(`errorHandler`)

  const err = anyToErrorObject(_err) as ErrorObject<HttpErrorData>
  err.data = {
    httpStatusCode: 500, // default
    ...err.data,
  }

  if (APP_ENV === 'prod' || APP_ENV === 'test') {
    delete err.stack
  }

  const { path } = req

  console.error(`HTTP ${err.data.httpStatusCode} ${path} ${err.message}`)

  const resp: HttpErrorResponse = {
    error: err,
  }

  res.status(err.data.httpStatusCode).json(resp)
}
