import { _ms, HttpError } from '@naturalcycles/js-lib'
import {
  BackendRequestHandler,
  getRequestEndpoint,
  onFinished,
  respondWithError,
} from '../../index'

export interface RequestTimeoutCfg {
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

export function requestTimeout(cfg: RequestTimeoutCfg = {}): BackendRequestHandler {
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

  return (req, res, next) => {
    const timeoutSeconds = req.query[REQUEST_TIMEOUT_QUERY_KEY]
      ? Number.parseInt(req.query[REQUEST_TIMEOUT_QUERY_KEY] as string)
      : defTimeoutSeconds

    // Set timer if it wasn't previously set
    req.requestTimeout ??= setTimeout(() => {
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
