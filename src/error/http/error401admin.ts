import { HttpErrorData } from '@naturalcycles/js-lib'
import { Error401 } from './error401'

/**
 * HTTP 401: Admin authorization required
 */
export class Error401Admin extends Error401 {
  constructor (message = 'Admin authorization required', data?: Partial<HttpErrorData>) {
    super(message, data)
  }
}
