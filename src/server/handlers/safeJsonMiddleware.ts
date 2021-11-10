import { _safeJsonStringify } from '@naturalcycles/js-lib'
import { RequestHandler, Response } from 'express'

/**
 * Replaces express's built-in req.json() function with the safe one,
 * protected from circular references.
 *
 * Original: https://github.com/expressjs/express/blob/master/lib/response.js
 */
export function safeJsonMiddleware(): RequestHandler {
  return function safeJsonHandler(req, res, next) {
    res.json = (input: any): Response => {
      if (!res.get('Content-Type')) {
        res.set('Content-Type', 'application/json')
      }

      return res.send(_safeJsonStringify(input))
    }

    next()
  }
}
