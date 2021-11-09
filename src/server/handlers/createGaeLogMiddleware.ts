import { inspect } from 'util'
import { dimGrey } from '@naturalcycles/nodejs-lib/dist/colors'
import { inspectAny } from '@naturalcycles/nodejs-lib'
import { _defineLazyProperty, _objectKeys, AnyObject } from '@naturalcycles/js-lib'
import { RequestHandler } from 'express'

const severityMap: Record<SimpleLogLevel, string> = {
  debug: 'DEBUG',
  info: 'INFO',
  warn: 'WARNING',
  error: 'ERROR',
}

export enum SimpleLogLevel {
  debug = 'debug',
  info = 'info',
  warn = 'warn',
  error = 'error',
}

export type SimpleLoggerFn = (...args: any[]) => void

export interface SimpleLogger extends SimpleLoggerFn {
  debug: SimpleLoggerFn
  info: SimpleLoggerFn
  warn: SimpleLoggerFn
  error: SimpleLoggerFn
}

declare module 'http' {
  interface IncomingMessage {
    log: SimpleLogger
  }

  // Disabled now, let's start with only `req.log`, to reduce ambiguity
  // interface ServerResponse {
  //   log: SimpleLogger
  // }
}

const { GOOGLE_CLOUD_PROJECT, GAE_INSTANCE } = process.env
const isGAE = !!GAE_INSTANCE

// Simple "request number" (poor man's "correlation id") counter, to use on dev machine (not in the cloud)
let reqNum = 0

// Documented here: https://cloud.google.com/logging/docs/structured-logging
function logSimple(meta: AnyObject, args: any[]): void {
  if (!isGAE) {
    // Run on local machine
    console.log(
      [
        meta['reqNum'] ? [dimGrey('[' + meta['reqNum'] + ']')] : [],
        ...args.map(a => inspectAny(a, { includeErrorStack: true, colors: true })),
      ].join(' '),
    )
  } else {
    console.log(
      JSON.stringify({
        message: args.map(a => (typeof a === 'string' ? a : inspect(a))).join(' '),
        ...meta,
      }),
    )
  }
}

export function createSimpleLogger(meta: AnyObject = {}): SimpleLogger {
  const loggerFn: SimpleLoggerFn = (...args) => logSimple(meta, args)
  const logger = loggerFn as SimpleLogger
  _objectKeys(SimpleLogLevel).forEach(
    level =>
      (logger[level] = (...args) => logSimple({ ...meta, severity: severityMap[level] }, args)),
  )
  return logger
}

export function createGAELogMiddleware(): RequestHandler {
  return function gaeLogMiddleware(req, res, next) {
    // req.log is defined lazily, cause often it's used 0 times within a request

    _defineLazyProperty(req, 'log', () => {
      const meta: AnyObject = {}
      const traceHeader = req.header('x-cloud-trace-context')
      if (traceHeader && GOOGLE_CLOUD_PROJECT) {
        const [trace] = traceHeader.split('/')
        Object.assign(meta, {
          'logging.googleapis.com/trace': `projects/${GOOGLE_CLOUD_PROJECT}/traces/${trace}`,
          'appengine.googleapis.com/request_id': req.header('x-appengine-request-log-id'),
        })
      } else if (!isGAE) {
        meta['reqNum'] = ++reqNum
      }

      return createSimpleLogger(meta)
    })

    // req.log = createSimpleLogger(meta)

    next()
  }
}
