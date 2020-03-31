import { anyToErrorMessage } from '@naturalcycles/js-lib'
import { chalk, Debug, dimGrey } from '@naturalcycles/nodejs-lib'
import { since } from '@naturalcycles/time-lib'
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
      log(['>>', req.method, chalk.bold(req.url)].join(' '))
    }

    if (logFinish) {
      onFinished(res, () => {
        if (res.__err) {
          logRequest(req, res.statusCode, dimGrey(since(started)), anyToErrorMessage(res.__err))
        } else {
          logRequest(req, res.statusCode, dimGrey(since(started)))
        }
      })
    }

    next()
  }
}