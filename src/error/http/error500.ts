import { HttpError, HttpErrorData } from '@naturalcycles/js-lib'

/**
 * HTTP 500: Internal Server Error (generic uncategorized error)
 */
export class Error500 extends HttpError {
  constructor (message = 'Internal Server Error', data?: Partial<HttpErrorData>) {
    super(message, {
      httpStatusCode: 500,
      ...data,
    })

    this.constructor = Error500
    ;(this as any).__proto__ = this.constructor.prototype
    Object.defineProperty(this, 'name', {
      value: this.constructor.name,
      configurable: true,
    })
  }
}
