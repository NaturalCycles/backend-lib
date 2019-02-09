import { HttpError, HttpErrorData } from '@naturalcycles/js-lib'

/**
 * HTTP 404: Not Found
 */
export class Error404 extends HttpError {
  constructor (message = 'Not found', data?: Partial<HttpErrorData>) {
    super(message, {
      httpStatusCode: 404,
      ...data,
    })
  }
}
