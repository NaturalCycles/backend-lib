import { HttpErrorData } from '@naturalcycles/js-lib'
import { Error403 } from './error403'

/**
 * HTTP 403: Admin access forbidden
 */
export class Error403Admin extends Error403 {
  constructor (message = 'Admin access forbidden', data?: Partial<HttpErrorData>) {
    super(message, data)

    this.constructor = Error403Admin
    ;(this as any).__proto__ = this.constructor.prototype
    Object.defineProperty(this, 'name', {
      value: this.constructor.name,
      configurable: true,
    })
  }
}
