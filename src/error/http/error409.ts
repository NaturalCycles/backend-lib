import { HttpError, HttpErrorData } from '@naturalcycles/js-lib'

/**
 * HTTP 409: Conflict
 */
export class Error409 extends HttpError {
  constructor (message = 'Conflict', data?: Partial<HttpErrorData>) {
    super(message, {
      httpStatusCode: 409,
      ...data,
    })
  }
}
