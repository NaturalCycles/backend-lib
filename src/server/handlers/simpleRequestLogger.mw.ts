import { _anyToErrorMessage, _since } from '@naturalcycles/js-lib'
import { Debug } from '@naturalcycles/nodejs-lib'
import { boldGrey, dimGrey } from '@naturalcycles/nodejs-lib/dist/colors'
import { RequestHandler } from 'express'
import { onFinished } from '../../index'
import { ResponseWithError } from '../error.util'
import { logRequest } from '../request.log.util'

const log = Debug('nc:backend-lib')

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
  const cfg: SimpleRequestLoggerCfg = {
    logStart: false,
    logFinish: true,
    ..._cfg,
  }
  const { logStart, logFinish } = cfg

  return (req, res: ResponseWithError, next) => {
    const started = Date.now()

    if (logStart) {
      log(['>>', req.method, boldGrey(req.url)].join(' '))
    }

    if (logFinish) {
      onFinished(res, () => {
        if (res.__err) {
          logRequest(req, res.statusCode, dimGrey(_since(started)), _anyToErrorMessage(res.__err))
        } else {
          logRequest(req, res.statusCode, dimGrey(_since(started)))
        }
      })
    }

    next()
  }
}
