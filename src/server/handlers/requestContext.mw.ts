import type * as clsLib from 'cls-hooked'
import { RequestHandler } from 'express'

// Inspired by: https://github.com/skonves/express-http-context

export const REQUEST_CONTEXT_NAMESPACE = 'requestContextNamespace'
// const REQUEST_CONTEXT_KEY = 'requestContextKey'

// lazy property, to prevent memory leak just on `require('backend-lib')`
export let _namespace: clsLib.Namespace
function getNamespace(): clsLib.Namespace {
  if (!_namespace) {
    console.log(`Creating ${REQUEST_CONTEXT_NAMESPACE}`)
    const cls = require('cls-hooked') as typeof clsLib
    _namespace = cls.createNamespace(REQUEST_CONTEXT_NAMESPACE)
  }

  return _namespace
}

export function getRequestContextProperty<T = any>(key: string): T | undefined {
  const namespace = getNamespace()
  return namespace.active && namespace.get(key)
}

export function setRequestContextProperty(key: string, value: any): void {
  const namespace = getNamespace()
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
    getNamespace().run(() => next())
  }
}
