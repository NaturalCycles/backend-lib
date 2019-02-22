import { HttpError, HttpErrorData } from '@naturalcycles/js-lib'

/**
 * HTTP 401: Unauthorized
 */
export class Error401 extends HttpError {
  constructor (message = 'Unauthorized', data?: Partial<HttpErrorData>) {
    super(message, {
      httpStatusCode: 401,
      ...data,
    })

    Object.defineProperty(this, 'name', {
      value: 'Error401',
      configurable: true,
    })
  }
}
