import { HttpError } from '@naturalcycles/js-lib'
import { RequestHandler } from 'express'
import { onFinished } from '../../index'
import { respondWithError } from '../error.util'

export interface RequestTimeoutCfg {
  /**
   * @default 60
   */
  timeoutSeconds?: number

  /**
   * @default 503
   */
  httpStatusCode?: number

  /**
   * @default 'Request timed out'
   */
  httpStatus?: string
}

const code = 'REQUEST_TIMEOUT'

export function requestTimeout (cfg: RequestTimeoutCfg = {}): RequestHandler {
  const { timeoutSeconds, httpStatusCode, httpStatus } = {
    timeoutSeconds: 60,
    httpStatusCode: 503,
    httpStatus: 'Request timed out',
    ...cfg,
  }

  const timeout = timeoutSeconds * 1000

  return (req, res, next) => {
    const timer = setTimeout(() => {
      if (res.headersSent) return

      respondWithError(
        req,
        res,
        new HttpError(httpStatus, {
          code,
          httpStatusCode,
          userFriendly: true,
        }),
      )
    }, timeout)

    onFinished(res, () => clearTimeout(timer))

    next()
  }
}
