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

    this.constructor = Error409
    ;(this as any).__proto__ = this.constructor.prototype
    Object.defineProperty(this, 'name', {
      value: this.constructor.name,
      configurable: true,
    })
  }
}
