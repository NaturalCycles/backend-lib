import { inspect } from 'util'
import { dimGrey } from '@naturalcycles/nodejs-lib/dist/colors'
import { inspectAny } from '@naturalcycles/nodejs-lib'
import { AnyObject, CommonLogFunction, CommonLogger } from '@naturalcycles/js-lib'
import { Request, RequestHandler } from 'express'

/**
 * Use this interface instead of express.Request in cases when TypeScript gives an error, because it haven't "included" this very file
 */
export interface RequestWithLog extends Request {
  log: CommonLogFunction
  warn: CommonLogFunction
  error: CommonLogFunction

  requestId?: string
}

declare module 'http' {
  interface IncomingMessage {
    log: CommonLogFunction
    warn: CommonLogFunction
    error: CommonLogFunction

    requestId?: string
  }
}

const { GOOGLE_CLOUD_PROJECT, GAE_INSTANCE } = process.env
const isGAE = !!GAE_INSTANCE

// Simple "request counter" (poor man's "correlation id") counter, to use on dev machine (not in the cloud)
let reqCounter = 0

/**
 * Logger that logs in AppEngine format.
 * To be used in outside-of-request situations (otherwise req.log should be used).
 */
export const gaeLogger: CommonLogger = {
  log: (...args) => logToAppEngine({}, args),
  warn: (...args) => logToAppEngine({ severity: 'WARNING' }, args),
  error: (...args) => logToAppEngine({ severity: 'ERROR' }, args),
}

/**
 * Fancy development logger, to be used in outside-of-request situations
 * (otherwise req.log should be used).
 */
export const devLogger: CommonLogger = {
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

function logToDev(requestId: string | null, args: any[]): void {
  // Run on local machine
  console.log(
    [
      requestId ? [dimGrey(`[${requestId}]`)] : [],
      ...args.map(a => inspectAny(a, { includeErrorStack: true, colors: true })),
    ].join(' '),
  )
}

export function createGAELogMiddleware(): RequestHandler {
  if (!isGAE || !GOOGLE_CLOUD_PROJECT) {
    // Local machine, return "simple" logToDev middleware with request numbering
    return function gaeLogMiddlewareDev(req, res, next) {
      // Local machine
      req.requestId = String(++reqCounter)
      req.log = req.warn = req.error = (...args: any[]) => logToDev(req.requestId!, args)
      next()
    }
  }

  // Otherwise, we're in AppEngine

  return function gaeLogMiddleware(req, res, next) {
    const traceHeader = req.header('x-cloud-trace-context')
    if (traceHeader) {
      const [trace] = traceHeader.split('/')
      const meta = {
        'logging.googleapis.com/trace': `projects/${GOOGLE_CLOUD_PROJECT}/traces/${trace}`,
        'appengine.googleapis.com/request_id': req.header('x-appengine-request-log-id'),
      }
      Object.assign(req, {
        log: (...args: any[]) => logToAppEngine({ ...meta, severity: 'INFO' }, args),
        warn: (...args: any[]) => logToAppEngine({ ...meta, severity: 'WARNING' }, args),
        error: (...args: any[]) => logToAppEngine({ ...meta, severity: 'ERROR' }, args),
      })
      req.requestId = trace
    } else {
      Object.assign(req, gaeLogger)
    }

    next()
  }
}
