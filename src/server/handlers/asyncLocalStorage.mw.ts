import { AsyncLocalStorage } from 'async_hooks'
import { _lazyValue, SimpleLogger } from '@naturalcycles/js-lib'
import { Request, RequestHandler } from 'express'
import { createAppEngineLogger } from './createGaeLogMiddleware'

export interface RequestLocalStorage {
  req: Request
}

// Singleton, for simplicity
// Create it lazily (on demand)
const storage = _lazyValue(() => new AsyncLocalStorage<RequestLocalStorage>())

export function createAsyncLocalStorage(): RequestHandler {
  return (req, res, next) => {
    const store: RequestLocalStorage = {
      req,
    }

    storage().run(store, () => next())
  }
}

export function getRequest(): Request {
  return storage().getStore()!.req
}

/**
 * It requires both `createAsyncLocalStorage` and `createGAELogMiddleware` to be in use to work.
 */
export function getRequestLogger(): SimpleLogger {
  return storage().getStore()?.req.log || createAppEngineLogger()
}
