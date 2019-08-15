import { Debug } from '@naturalcycles/nodejs-lib'
import * as c from 'ansi-colors'
import { RequestHandler } from 'express'
import { onFinished } from '../../index'

const log = Debug('nc:backend-lib:request')

export interface RequestTimeoutCfg {
  /**
   * @default 60
   */
  timeoutSeconds?: number

  /**
   * @default 503
   */
  httpCode?: number

  /**
   * @default 'Request timed out'
   */
  httpStatus?: string
}

export function requestTimeout (cfg: RequestTimeoutCfg = {}): RequestHandler {
  const { timeoutSeconds, httpCode, httpStatus } = {
    timeoutSeconds: 60,
    httpCode: 503,
    httpStatus: 'Request timed out',
    ...cfg,
  }

  const timeout = timeoutSeconds * 1000

  return (req, res, next) => {
    const timer = setTimeout(() => {
      if (res.headersSent) return

      log.warn(
        [
          c.red(String(httpCode)),
          req.method,
          c.bold(req.url),
          httpStatus,
          `(${timeoutSeconds} sec)`,
        ].join(' '),
      )

      res
        .status(httpCode)
        .send(httpStatus)
        .end()
    }, timeout)

    onFinished(res, () => clearTimeout(timer))

    next()
  }
}
