import { HttpError, HttpErrorData } from '@naturalcycles/js-lib'

/**
 * HTTP 403: Forbidden
 */
export class Error403 extends HttpError {
  constructor (message = 'Forbidden', data?: Partial<HttpErrorData>) {
    super(message, {
      httpStatusCode: 403,
      ...data,
    })
  }
}
