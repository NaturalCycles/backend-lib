import { RequestHandler } from 'express'

// https://strongloop.com/strongblog/async-error-handling-expressjs-es7-promises-generators/
// https://stackoverflow.com/a/43564267/4919972
export const catchWrapper =
  (fn: RequestHandler): RequestHandler =>
  async (req, res, next) => {
    try {
      // eslint-disable-next-line @typescript-eslint/await-thenable
      await fn(req, res, next)
    } catch (err) {
      next(err)
    }
  }
