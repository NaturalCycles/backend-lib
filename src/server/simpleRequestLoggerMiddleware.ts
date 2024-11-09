import { _since, UnixTimestampMillis } from '@naturalcycles/js-lib'
import { boldGrey, dimGrey } from '@naturalcycles/nodejs-lib'
import { BackendRequestHandler, onFinished } from '../index'
import { logRequest } from './request.log.util'

const { APP_ENV } = process.env

export interface SimpleRequestLoggerMiddlewareCfg {
  /**
   * @default false
   */
  logStart: boolean

  /**
   * @default true
   */
  logFinish: boolean
}

export function simpleRequestLoggerMiddleware(
  _cfg: Partial<SimpleRequestLoggerMiddlewareCfg> = {},
): BackendRequestHandler {
  // Disable logger in AppEngine, as it doesn't make sense there
  // UPD: Only log in dev environment
  if (APP_ENV !== 'dev') return (_req, _res, next) => next()

  const cfg: SimpleRequestLoggerMiddlewareCfg = {
    logStart: false,
    logFinish: true,
    ..._cfg,
  }
  const { logStart, logFinish } = cfg

  return (req, res, next) => {
    const started = Date.now() as UnixTimestampMillis

    if (logStart) {
      req.log(['>>', req.method, boldGrey(req.url)].join(' '))
    }

    if (logFinish) {
      onFinished(res, () => {
        logRequest(req, res.statusCode, dimGrey(_since(started)))

        // Avoid logging twice. It was previously logged by genericErrorHandler
        // if (res.__err) {
        //   logRequest(req, res.statusCode, dimGrey(_since(started)), _inspect(res.__err))
        // } else {
        //   logRequest(req, res.statusCode, dimGrey(_since(started)))
        // }
      })
    }

    next()
  }
}
