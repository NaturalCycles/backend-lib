import { HttpError } from '@naturalcycles/js-lib'
import { RequestHandler } from 'express'
import { Request } from 'express'
import { respondWithError } from '../error.util'

export interface BodyParserTimeoutCfg {
  /**
   * @default 10
   */
  timeoutSeconds?: number

  /**
   * @default 400
   */
  httpStatusCode?: number

  /**
   * @default 'Timeout reading request input'
   */
  httpStatus?: string
}

interface RequestWithTimeout extends Request {
  _bodyParserTimeout?: NodeJS.Timeout
}

const code = 'BODY_PARSER_TIMEOUT'

/**
 * Should be called BEFORE bodyParser
 */
export function bodyParserTimeout(cfg: BodyParserTimeoutCfg = {}): RequestHandler {
  const { timeoutSeconds, httpStatusCode, httpStatus } = {
    timeoutSeconds: 10,
    httpStatusCode: 400,
    httpStatus: 'Timeout reading request input',
    ...cfg,
  }

  const timeout = timeoutSeconds * 1000

  return (req: RequestWithTimeout, res, next) => {
    req._bodyParserTimeout = setTimeout(() => {
      if (res.headersSent) return

      respondWithError(
        req,
        res,
        new HttpError(httpStatus, {
          code,
          httpStatusCode,
          // userFriendly: true, // no, cause this error is not expected
        }),
      )
    }, timeout)

    next()
  }
}

/**
 * Should be called AFTER bodyParser
 */
export function clearBodyParserTimeout(): RequestHandler {
  return (req: RequestWithTimeout, res, next) => {
    if (req._bodyParserTimeout) clearTimeout(req._bodyParserTimeout)
    next()
  }
}
