import { _since } from '@naturalcycles/js-lib'
import { boldGrey, dimGrey } from '@naturalcycles/nodejs-lib/dist/colors'
import { RequestHandler, Response } from 'express'
import { isGAE, onFinished } from '../../index'
import { logRequest } from '../request.log.util'

export interface SimpleRequestLoggerCfg {
  /**
   * @default false
   */
  logStart: boolean

  /**
   * @default true
   */
  logFinish: boolean
}

export function simpleRequestLogger(_cfg: Partial<SimpleRequestLoggerCfg> = {}): RequestHandler {
  // Disable logger in AppEngine, as it doesn't make sense there
  if (isGAE()) return (req, res, next) => next()

  const cfg: SimpleRequestLoggerCfg = {
    logStart: false,
    logFinish: true,
    ..._cfg,
  }
  const { logStart, logFinish } = cfg

  return (req, res: Response, next) => {
    const started = Date.now()

    if (logStart) {
      req.log(['>>', req.method, boldGrey(req.url)].join(' '))
    }

    if (logFinish) {
      onFinished(res, () => {
        logRequest(req, res.statusCode, dimGrey(_since(started)))

        // Avoid logging twice. It was previously logged by genericErrorHandler
        // if (res.__err) {
        //   logRequest(req, res.statusCode, dimGrey(_since(started)), inspectAny(res.__err))
        // } else {
        //   logRequest(req, res.statusCode, dimGrey(_since(started)))
        // }
      })
    }

    next()
  }
}
