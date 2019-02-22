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

    this.constructor = Error400
    ;(this as any).__proto__ = this.constructor.prototype
    Object.defineProperty(this, 'name', {
      value: this.constructor.name,
      configurable: true,
    })
  }
}
