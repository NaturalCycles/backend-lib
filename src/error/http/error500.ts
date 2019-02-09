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
  }
}
