import { Debug } from '@naturalcycles/nodejs-lib'
import * as c from 'ansi-colors'
import { RequestHandler } from 'express'
import { Request } from 'express'

const log = Debug('nc:backend-lib:request')

export interface BodyParserTimeoutCfg {
  /**
   * @default 10
   */
  timeoutSeconds?: number

  /**
   * @default 400
   */
  httpCode?: number

  /**
   * @default 'Timeout reading request input'
   */
  httpStatus?: string
}

interface RequestWithTimeout extends Request {
  _bodyParserTimeout?: NodeJS.Timeout
}

/**
 * Should be called BEFORE bodyParser
 */
export function bodyParserTimeout (cfg: BodyParserTimeoutCfg = {}): RequestHandler {
  const { timeoutSeconds, httpCode, httpStatus } = {
    timeoutSeconds: 10,
    httpCode: 400,
    httpStatus: 'Timeout reading request input',
    ...cfg,
  }

  const timeout = timeoutSeconds * 1000

  return (req: RequestWithTimeout, res, next) => {
    req._bodyParserTimeout = setTimeout(() => {
      if (res.headersSent) return

      log.warn(
        [c.red(String(httpCode)), req.method, c.bold(req.url), httpStatus, `(${timeout} sec)`].join(
          ' ',
        ),
      )

      res
        .status(httpCode)
        .send(httpStatus)
        .end()
    }, timeout)

    next()
  }
}

/**
 * Should be called AFTER bodyParser
 */
export function clearBodyParserTimeout (): RequestHandler {
  return (req: RequestWithTimeout, res, next) => {
    if (req._bodyParserTimeout) clearTimeout(req._bodyParserTimeout)
    next()
  }
}
