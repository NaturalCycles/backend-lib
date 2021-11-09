import { inspect } from 'util'
import { dimGrey } from '@naturalcycles/nodejs-lib/dist/colors'
import { inspectAny } from '@naturalcycles/nodejs-lib'
import { AnyObject, CommonLogFunction, CommonLogger } from '@naturalcycles/js-lib'
import { RequestHandler } from 'express'

declare module 'http' {
  interface IncomingMessage {
    log: CommonLogFunction
    warn: CommonLogFunction
    error: CommonLogFunction
  }
}

const { GOOGLE_CLOUD_PROJECT, GAE_INSTANCE } = process.env
const isGAE = !!GAE_INSTANCE

// Simple "request number" (poor man's "correlation id") counter, to use on dev machine (not in the cloud)
let reqNum = 0

/**
 * Outside-of-request logger.
 */
export const defaultAppEngineLogger: CommonLogger = {
  log: (...args) => logToAppEngine({}, args),
  warn: (...args) => logToAppEngine({ severity: 'WARNING' }, args),
  error: (...args) => logToAppEngine({ severity: 'ERROR' }, args),
}

/**
 * Outside-of-request local logger
 */
export const defaultDevLogger: CommonLogger = {
  log: (...args) => logToAppEngineDev(null, args),
  warn: (...args) => logToAppEngineDev(null, args),
  error: (...args) => logToAppEngineDev(null, args),
}

// Documented here: https://cloud.google.com/logging/docs/structured-logging
function logToAppEngine(meta: AnyObject, args: any[]): void {
  console.log(
    JSON.stringify({
      message: args.map(a => (typeof a === 'string' ? a : inspect(a))).join(' '),
      ...meta,
    }),
  )
}

function logToAppEngineDev(reqNumber: number | null, args: any[]): void {
  // Run on local machine
  console.log(
    [
      reqNumber ? [dimGrey('[' + reqNumber + ']')] : [],
      ...args.map(a => inspectAny(a, { includeErrorStack: true, colors: true })),
    ].join(' '),
  )
}

export function createGAELogMiddleware(): RequestHandler {
  return function gaeLogMiddleware(req, res, next) {
    if (!isGAE || !GOOGLE_CLOUD_PROJECT) {
      // Local machine
      const reqNumber = ++reqNum
      req.log = req.warn = req.error = (...args: any[]) => logToAppEngineDev(reqNumber, args)
    } else {
      // req.log is defined lazily, cause often it's used 0 times within a request

      const meta: AnyObject = {}
      const traceHeader = req.header('x-cloud-trace-context')
      if (traceHeader) {
        const [trace] = traceHeader.split('/')
        Object.assign(meta, {
          'logging.googleapis.com/trace': `projects/${GOOGLE_CLOUD_PROJECT}/traces/${trace}`,
          'appengine.googleapis.com/request_id': req.header('x-appengine-request-log-id'),
        })
      }

      Object.assign(req, {
        log: (...args: any[]) => logToAppEngine({ ...meta, severity: 'INFO' }, args),
        warn: (...args: any[]) => logToAppEngine({ ...meta, severity: 'WARNING' }, args),
        error: (...args: any[]) => logToAppEngine({ ...meta, severity: 'ERROR' }, args),
      })
    }

    next()
  }
}
