import { inspect } from 'util'
import { dimGrey } from '@naturalcycles/nodejs-lib/dist/colors'
import { inspectAny } from '@naturalcycles/nodejs-lib'
import { _defineLazyProperty, AnyObject, SimpleLogger } from '@naturalcycles/js-lib'
import { RequestHandler } from 'express'

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
function logToAppEngine(meta: AnyObject, args: any[]): void {
  console.log(
    JSON.stringify({
      message: args.map(a => (typeof a === 'string' ? a : inspect(a))).join(' '),
      ...meta,
    }),
  )
}

function logToAppEngineDev(meta: AnyObject, args: any[]): void {
  // Run on local machine
  console.log(
    [
      meta['reqNum'] ? [dimGrey('[' + meta['reqNum'] + ']')] : [],
      ...args.map(a => inspectAny(a, { includeErrorStack: true, colors: true })),
    ].join(' '),
  )
}

export function createAppEngineLogger(meta: AnyObject = {}): SimpleLogger {
  if (!isGAE) {
    return Object.assign(
      (...args: any[]) => logToAppEngineDev({ ...meta, severity: 'INFO' }, args),
      {
        log: (...args: any[]) => logToAppEngineDev({ ...meta, severity: 'INFO' }, args),
        warn: (...args: any[]) => logToAppEngineDev({ ...meta, severity: 'WARNING' }, args),
        error: (...args: any[]) => logToAppEngineDev({ ...meta, severity: 'ERROR' }, args),
      },
    )
  }

  return Object.assign((...args: any[]) => logToAppEngine({ ...meta, severity: 'INFO' }, args), {
    log: (...args: any[]) => logToAppEngine({ ...meta, severity: 'INFO' }, args),
    warn: (...args: any[]) => logToAppEngine({ ...meta, severity: 'WARNING' }, args),
    error: (...args: any[]) => logToAppEngine({ ...meta, severity: 'ERROR' }, args),
  })
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

      return createAppEngineLogger(meta)
    })

    next()
  }
}
