import {
  ErrorObject,
  HttpErrorData,
  HttpErrorResponse,
  _anyToErrorObject,
} from '@naturalcycles/js-lib'
import { Request, Response } from 'express'

export interface ResponseWithError extends Response {
  __err?: any
}

const { APP_ENV } = process.env

export function respondWithError(req: Request, res: Response, _err: any): void {
  if (_err) {
    // Attach error to response, so simpleRequestLogger can pick it up
    ;(res as ResponseWithError).__err = _err
  }

  const error = _anyToErrorObject(_err) as ErrorObject<HttpErrorData>
  error.data = {
    // @ts-ignore
    httpStatusCode: 500, // default
    ...error.data,
  }

  if (APP_ENV === 'prod' || APP_ENV === 'test') {
    delete error.stack
  }

  res.status(error.data.httpStatusCode).json({
    error,
  } as HttpErrorResponse)
}
