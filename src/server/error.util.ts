import { HttpErrorData, HttpErrorResponse, _anyToErrorObject } from '@naturalcycles/js-lib'
import { Request, Response } from 'express'

export interface ResponseWithError extends Response {
  __err?: any
}

const { APP_ENV } = process.env
const includeErrorStack = APP_ENV !== 'prod' && APP_ENV !== 'test'

export function respondWithError(req: Request, res: Response, _err: any): void {
  if (_err) {
    // Attach error to response, so simpleRequestLogger can pick it up
    ;(res as ResponseWithError).__err = _err
  }

  const error = _anyToErrorObject<HttpErrorData>(_err, {
    includeErrorStack,
    includeErrorData: true,
  })

  error.data.httpStatusCode ||= 500 // default to 500

  res.status(error.data.httpStatusCode).json({
    error,
  } as HttpErrorResponse)
}
