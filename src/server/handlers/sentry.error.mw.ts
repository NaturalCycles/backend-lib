import { HttpErrorData } from '@naturalcycles/js-lib'
import { ErrorRequestHandler } from 'express'
import { SentrySharedService } from '../..'

const HTTP_FAMILIES_TO_EXCLUDE = new Set([
  2, // 2xx
  3, // 3xx
  4, // 4xx
])

export interface SentryErrorMiddlewareCfg {
  sentryService: SentrySharedService
}

/**
 * Mutates err with err.data.errorId.
 * Passes error further via next(err).
 */
export function sentryErrorMiddleware (cfg: SentryErrorMiddlewareCfg): ErrorRequestHandler {
  return (err, req, res, next) => {
    if (!err) return next(err)

    err.data = {
      ...err.data,
    }

    const httpStatusCode = (err.data as HttpErrorData).httpStatusCode || 500

    if (shouldReportToSentry(httpStatusCode)) {
      const errorId = cfg.sentryService.captureException(err)

      Object.assign(err.data, {
        errorId,
      })
    }

    next(err)
  }
}

function shouldReportToSentry (httpCode: number): boolean {
  const family = Math.floor(httpCode / 100)
  return !HTTP_FAMILIES_TO_EXCLUDE.has(family)
}
