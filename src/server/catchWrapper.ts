import { BackendRequestHandler } from './server.model'

// https://strongloop.com/strongblog/async-error-handling-expressjs-es7-promises-generators/
// https://stackoverflow.com/a/43564267/4919972
export const catchWrapper =
  (fn: BackendRequestHandler): BackendRequestHandler =>
  async (req, res, next) => {
    try {
      await fn(req, res, next)
    } catch (err) {
      next(err)
    }
  }
