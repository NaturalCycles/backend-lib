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
  httpErrorMessage?: string
}

const code = 'REQUEST_TIMEOUT'
const REQUEST_TIMEOUT_QUERY_KEY = 'requestTimeout'

export function requestTimeout(cfg: RequestTimeoutCfg = {}): RequestHandler {
  const { timeoutSeconds, httpStatusCode, httpErrorMessage } = {
    timeoutSeconds: 60,
    httpStatusCode: 503,
    httpErrorMessage: 'Request timed out',
    ...cfg,
  }

  const defTimeout = timeoutSeconds * 1000

  return (req, res, next) => {
    const timeout = req.query[REQUEST_TIMEOUT_QUERY_KEY]
      ? parseInt(req.query[REQUEST_TIMEOUT_QUERY_KEY] as string)
      : defTimeout

    const timer = setTimeout(() => {
      if (res.headersSent) return

      respondWithError(
        req,
        res,
        new HttpError(httpErrorMessage, {
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
