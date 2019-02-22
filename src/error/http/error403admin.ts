import { HttpErrorData } from '@naturalcycles/js-lib'
import { Error403 } from './error403'

/**
 * HTTP 403: Admin access forbidden
 */
export class Error403Admin extends Error403 {
  constructor (message = 'Admin access forbidden', data?: Partial<HttpErrorData>) {
    super(message, data)

    Object.defineProperty(this, 'name', {
      value: 'Error403Admin',
      configurable: true,
    })
  }
}
