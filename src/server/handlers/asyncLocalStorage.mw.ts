import { AsyncLocalStorage } from 'async_hooks'
import { _lazyValue, CommonLogger } from '@naturalcycles/js-lib'
import { BackendRequest, BackendRequestHandler } from '../server.model'
import { gaeLogger, devLogger } from './createGaeLogMiddleware'

const { GAE_INSTANCE } = process.env
const isGAE = !!GAE_INSTANCE

export interface RequestLocalStorage {
  req: BackendRequest
}

// Singleton, for simplicity
// Create it lazily (on demand)
const storage = _lazyValue(() => new AsyncLocalStorage<RequestLocalStorage>())

export function createAsyncLocalStorage(): BackendRequestHandler {
  return (req, res, next) => {
    const store: RequestLocalStorage = {
      req,
    }

    storage().run(store, () => next())
  }
}

export function getRequest(): BackendRequest | undefined {
  return storage().getStore()?.req
}

/**
 * It requires both `createAsyncLocalStorage` and `createGAELogMiddleware` to be in use to work.
 *
 * @experimental
 */
export function getRequestLogger(): CommonLogger {
  return storage().getStore()?.req || (isGAE ? gaeLogger : devLogger)
}

/**
 * CommonLogger implementation that is Request-bound.
 * Should work the same as `req.log`, except that you don't have to have `req` available - it'll get it
 * from AsyncLocalStorage.
 *
 * It does `getRequestLogger` call on EVERY log call (may be slow, but worth trying).
 *
 * @experimental
 */
export const requestLogger: CommonLogger = {
  log: (...args) => getRequestLogger().log(...args),
  warn: (...args) => getRequestLogger().warn(...args),
  error: (...args) => getRequestLogger().error(...args),
}
