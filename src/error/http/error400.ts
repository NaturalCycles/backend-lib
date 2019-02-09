import { HttpError, HttpErrorData } from '@naturalcycles/js-lib'

/**
 * HTTP 400: Bad Request
 */
export class Error400 extends HttpError {
  constructor (message = 'Bad Request', data?: Partial<HttpErrorData>) {
    super(message, {
      httpStatusCode: 400,
      ...data,
    })
  }
}
