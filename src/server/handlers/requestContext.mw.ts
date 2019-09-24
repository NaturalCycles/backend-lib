import * as cls from 'cls-hooked'
import { RequestHandler } from 'express'

// Inspired by: https://github.com/skonves/express-http-context

export const REQUEST_CONTEXT_NAMESPACE = 'requestContextNamespace'
// const REQUEST_CONTEXT_KEY = 'requestContextKey'

const namespace = cls.createNamespace(REQUEST_CONTEXT_NAMESPACE)

export function getRequestContextProperty<T = any>(key: string): T | undefined {
  return namespace.active && namespace.get(key)
}

export function setRequestContextProperty(key: string, value: any): void {
  if (namespace.active) {
    namespace.set(key, value)
  }
}

/**
 * All further middlewares/handlers will run inside the Namespace.
 * So, will be able to get/set RequestContext object (similar to ThreadLocal variables in Java).
 */
export function requestContextMiddleware(): RequestHandler {
  return (req, res, next) => {
    namespace.run(() => next())
  }
}
