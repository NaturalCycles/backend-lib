import { HttpError } from '@naturalcycles/js-lib'
import { BackendRequestHandler, respondWithError } from '../../index'

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

const code = 'BODY_PARSER_TIMEOUT'

/**
 * Should be called BEFORE bodyParser
 */
export function bodyParserTimeout(cfg: BodyParserTimeoutCfg = {}): BackendRequestHandler {
  const { timeoutSeconds, httpStatusCode, httpStatus } = {
    timeoutSeconds: 10,
    httpStatusCode: 400,
    httpStatus: 'Timeout reading request input',
    ...cfg,
  }

  const timeout = timeoutSeconds * 1000

  return (req, res, next) => {
    req.bodyParserTimeout ??= setTimeout(() => {
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
export function clearBodyParserTimeout(): BackendRequestHandler {
  return (req, res, next) => {
    clearTimeout(req.bodyParserTimeout!)
    next()
  }
}
