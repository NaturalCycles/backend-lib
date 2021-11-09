import { HttpErrorData } from '@naturalcycles/js-lib'
import { ErrorRequestHandler } from 'express'
import { SentrySharedService } from '../..'

export interface SentryErrorMiddlewareCfg {
  sentryService: SentrySharedService
}

/**
 * Mutates err with err.data.errorId.
 * Passes error further via next(err).
 */
export function sentryErrorHandler(cfg: SentryErrorMiddlewareCfg): ErrorRequestHandler {
  return (err, req, res, next) => {
    if (!err) return next()

    err.data = {
      ...err.data,
    }

    const httpStatusCode = (err.data as HttpErrorData).httpStatusCode || 500

    if (shouldReportToSentry(httpStatusCode)) {
      err.data.errorId = cfg.sentryService.captureException(err)
    }

    next(err)
  }
}

function shouldReportToSentry(httpCode: number): boolean {
  // Only report 5xx
  return httpCode >= 500
}
