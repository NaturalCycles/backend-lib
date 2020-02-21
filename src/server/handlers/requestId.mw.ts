import { stringIdUnsafe } from '@naturalcycles/nodejs-lib'
import { RequestHandler } from 'express'
import { setRequestContextProperty } from './requestContext.mw'

export const REQUEST_ID_KEY = 'requestId'

/**
 * Assigns unique "requestId" to each http request, to act as "correlation id".
 * Depends on RequestContextMiddleware to be installed BEFORE, otherwise will emit warning and won't be able to attach RequestId.
 */
export function requestIdMiddleware(requestContextKey = REQUEST_ID_KEY): RequestHandler {
  return (req, res, next) => {
    // Inspired by: https://stackoverflow.com/a/54568864/4919972
    const requestId = req.header('x-cloud-trace-context')?.split('/')[0] || stringIdUnsafe(10)
    setRequestContextProperty(requestContextKey, requestId)
    next()
  }
}
