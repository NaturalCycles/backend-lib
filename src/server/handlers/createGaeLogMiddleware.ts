import { inspect } from 'util'
import { dimGrey } from '@naturalcycles/nodejs-lib/dist/colors'
import { inspectAny } from '@naturalcycles/nodejs-lib'
import { AnyObject, CommonLogFunction, CommonLogger } from '@naturalcycles/js-lib'
import { RequestHandler } from 'express'

/**
 * Use this interface instead of express.Request in cases when TypeScript gives an error, because it haven't "included" this very file
 */
export interface RequestWithLog {
  log: CommonLogFunction
  warn: CommonLogFunction
  error: CommonLogFunction
}

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
  log: (...args) => logToDev(null, args),
  warn: (...args) => logToDev(null, args),
  error: (...args) => logToDev(null, args),
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

function logToDev(reqNumber: number | null, args: any[]): void {
  // Run on local machine
  console.log(
    [
      reqNumber ? [dimGrey('[' + reqNumber + ']')] : [],
      ...args.map(a => inspectAny(a, { includeErrorStack: true, colors: true })),
    ].join(' '),
  )
}

export function createGAELogMiddleware(): RequestHandler {
  if (!isGAE || !GOOGLE_CLOUD_PROJECT) {
    // Local machine, return "simple" logToDev middleware with request numbering
    return function gaeLogMiddlewareDev(req, res, next) {
      // Local machine
      const reqNumber = ++reqNum
      req.log = req.warn = req.error = (...args: any[]) => logToDev(reqNumber, args)
      next()
    }
  }

  // Otherwise, we're in AppEngine

  return function gaeLogMiddleware(req, res, next) {
    const meta: AnyObject = {}

    const traceHeader = req.header('x-cloud-trace-context')
    if (traceHeader) {
      const [trace] = traceHeader.split('/')
      Object.assign(meta, {
        'logging.googleapis.com/trace': `projects/${GOOGLE_CLOUD_PROJECT}/traces/${trace}`,
        'appengine.googleapis.com/request_id': req.header('x-appengine-request-log-id'),
      })
      Object.assign(req, {
        log: (...args: any[]) => logToAppEngine({ ...meta, severity: 'INFO' }, args),
        warn: (...args: any[]) => logToAppEngine({ ...meta, severity: 'WARNING' }, args),
        error: (...args: any[]) => logToAppEngine({ ...meta, severity: 'ERROR' }, args),
      })
    } else {
      Object.assign(req, defaultAppEngineLogger)
    }

    next()
  }
}
