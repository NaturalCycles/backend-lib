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

    this.constructor = Error403
    ;(this as any).__proto__ = this.constructor.prototype
    Object.defineProperty(this, 'name', {
      value: this.constructor.name,
      configurable: true,
    })
  }
}
