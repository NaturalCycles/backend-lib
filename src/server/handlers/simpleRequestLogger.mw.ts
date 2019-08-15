import { Debug, DebugLogLevel } from '@naturalcycles/nodejs-lib'
import { since } from '@naturalcycles/time-lib'
import * as c from 'ansi-colors'
import { RequestHandler } from 'express'
import { onFinished } from '../../index'

const log = Debug('nc:backend-lib:request')

export interface SimpleRequestLoggerCfg {
  /**
   * @default false
   */
  logStart: boolean

  /**
   * @default true
   */
  logFinish: boolean

  /**
   * @default warn
   */
  logLevel4xx: DebugLogLevel

  /**
   * @default error
   */
  logLevel5xx: DebugLogLevel
}

export function simpleRequestLogger (_cfg: Partial<SimpleRequestLoggerCfg> = {}): RequestHandler {
  const cfg: SimpleRequestLoggerCfg = {
    logStart: false,
    logFinish: true,
    logLevel4xx: DebugLogLevel.warn,
    logLevel5xx: DebugLogLevel.error,
    ..._cfg,
  }
  const { logStart, logFinish } = cfg

  return (req, res, next) => {
    const started = Date.now()

    if (logStart) {
      log(`>> ${req.method} ${req.url}`)
    }

    if (logFinish) {
      onFinished(res, () => {
        log[logLevel(res.statusCode, cfg)](
          [coloredCode(res.statusCode), req.method, c.bold(req.url), c.dim(since(started))].join(
            ' ',
          ),
        )
      })
    }

    next()
  }
}

function coloredCode (statusCode: number): string {
  if (statusCode < 400) return c.green(String(statusCode))
  if (statusCode < 500) return c.yellow(String(statusCode))
  return c.red(String(statusCode))
}

function logLevel (statusCode: number, cfg: SimpleRequestLoggerCfg): DebugLogLevel {
  if (statusCode < 400) return DebugLogLevel.info
  if (statusCode < 500) return cfg.logLevel4xx
  return cfg.logLevel5xx
}
