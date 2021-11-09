import { AsyncLocalStorage } from 'async_hooks'
import { _lazyValue, CommonLogger } from '@naturalcycles/js-lib'
import { Request, RequestHandler } from 'express'
import { defaultAppEngineLogger, defaultDevLogger } from './createGaeLogMiddleware'

const { GAE_INSTANCE } = process.env
const isGAE = !!GAE_INSTANCE

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
export function getRequestLogger(): CommonLogger {
  return storage().getStore()?.req || (isGAE ? defaultAppEngineLogger : defaultDevLogger)
}
