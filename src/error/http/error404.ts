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

    this.constructor = Error404
    ;(this as any).__proto__ = this.constructor.prototype
    Object.defineProperty(this, 'name', {
      value: this.constructor.name,
      configurable: true,
    })
  }
}
