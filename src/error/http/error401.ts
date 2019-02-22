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

    this.constructor = Error401
    ;(this as any).__proto__ = this.constructor.prototype
    Object.defineProperty(this, 'name', {
      value: this.constructor.name,
      configurable: true,
    })
  }
}
