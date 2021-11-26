import { _ms, HttpError } from '@naturalcycles/js-lib'
import {
  BackendRequest,
  BackendRequestHandler,
  BackendResponse,
  getRequestEndpoint,
  onFinished,
  respondWithError,
} from '../index'

export interface RequestTimeoutMiddlewareCfg {
  /**
   * @default 120
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

export function requestTimeoutMiddleware(
  cfg: RequestTimeoutMiddlewareCfg = {},
): BackendRequestHandler {
  const {
    timeoutSeconds: defTimeoutSeconds,
    httpStatusCode,
    httpErrorMessage,
  } = {
    // Considerations about the default value of the timeout.
    // Ideally the default value here would be HIGHER than the default timeout for getGot (in nodejs-lib),
    // so, cross-service communication has a chance to fail SOONER than server times out,
    // so, proper error from exact service is shown, rather than generic "503 request timed out"
    timeoutSeconds: 120,
    httpStatusCode: 503,
    httpErrorMessage: 'Request timed out',
    ...cfg,
  }

  return function requestTimeoutHandler(req, res, next) {
    const timeoutSeconds = req.query[REQUEST_TIMEOUT_QUERY_KEY]
      ? Number.parseInt(req.query[REQUEST_TIMEOUT_QUERY_KEY] as string)
      : defTimeoutSeconds

    // If requestTimeout was previously set - cancel it first
    // Then set the new requestTimeout and handler
    if (req.requestTimeout) clearTimeout(req.requestTimeout)

    req.requestTimeout = setTimeout(() => {
      const endpoint = getRequestEndpoint(req)
      const msg = `${httpErrorMessage} on ${endpoint} after ${_ms(timeoutSeconds * 1000)}`

      respondWithError(
        req,
        res,
        new HttpError(msg, {
          code,
          httpStatusCode,
          endpoint,
          timeoutSeconds,
          // userFriendly: true, // no, cause this error is not expected
        }),
      )
    }, timeoutSeconds * 1000)

    onFinished(res, () => clearTimeout(req.requestTimeout!))

    next()
  }
}

export interface CustomRequestTimeoutMiddlewareCfg {
  /**
   * @default 120
   */
  timeoutSeconds?: number
}

/**
 * Example:
 *
 * router.get('/', customRequestTimeoutMiddleware(
 *   (req, res) => res.status(409).send('my custom message!'),
 *   { timeoutSeconds: 30 },
 * )
 */
export function customRequestTimeoutMiddleware(
  onTimeout: (req: BackendRequest, res: BackendResponse) => void | Promise<void>,
  cfg: CustomRequestTimeoutMiddlewareCfg,
): BackendRequestHandler {
  const { timeoutSeconds = 120 } = cfg

  return function customRequestTimeoutHandler(req, res, next) {
    if (req.requestTimeout) clearTimeout(req.requestTimeout)

    req.requestTimeout = setTimeout(async () => {
      try {
        await onTimeout(req, res)
      } catch (err) {
        next(err)
      }
    }, timeoutSeconds * 1000)

    onFinished(res, () => clearTimeout(req.requestTimeout!))

    next()
  }
}
