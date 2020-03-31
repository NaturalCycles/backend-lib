import { AppError, memo } from '@naturalcycles/js-lib'
import { Debug } from '@naturalcycles/nodejs-lib'
import type { Breadcrumb } from '@sentry/node'
import type * as SentryLib from '@sentry/node'
import { ErrorRequestHandler, RequestHandler } from 'express'
import { SentrySharedServiceCfg } from './sentry.model'

const log = Debug('nc:backend-lib:sentry')

export class SentrySharedService {
  constructor(private sentryServiceCfg: SentrySharedServiceCfg) {}

  init(): void {
    this.sentry()
  }

  @memo()
  sentry(): typeof SentryLib {
    // Lazy-loading `@sentry/node`
    // Reasons:
    // 1. Can be useful is this module is imported but never actually used
    // 2. Works around memory leak when used with Jest
    const Sentry = require('@sentry/node') as typeof SentryLib

    if (this.sentryServiceCfg.dsn) {
      // Sentry enabled
      log('SentryService init...')
    }

    Sentry.init({
      maxValueLength: 2000, // default is 250 characters
      ...this.sentryServiceCfg,
    })

    return Sentry
  }

  getRequestHandler(): RequestHandler {
    return this.sentry().Handlers.requestHandler()
  }

  getErrorHandler(): ErrorRequestHandler {
    return this.sentry().Handlers.errorHandler()
  }

  /**
   * For GDPR reasons we never send more information than just User ID.
   */
  setUserId(id: string): void {
    this.sentry().configureScope(scope => {
      scope.setUser({
        id,
      })
    })
  }

  /**
   * Returns "eventId"
   */
  captureException(err: any): string {
    log.error(err)

    // This is to avoid Sentry cutting the err.message to 253 characters
    // It will log additional "breadcrumb object" before the error
    // It's a Breadcrumb, not a console.log, because console.log are NOT automatically attached as Breadcrumbs in cron-job environments (outside of Express)
    if (err?.message) {
      this.sentry().addBreadcrumb({
        message: err.message,
        data: (err as AppError).data,
      })
    }

    return this.sentry().captureException(err)
  }

  /**
   * Returns "eventId"
   */
  captureMessage(msg: string, level?: SentryLib.Severity): string {
    log.error(msg)
    return this.sentry().captureMessage(msg, level)
  }

  addBreadcrumb(breadcrumb: Breadcrumb): void {
    this.sentry().addBreadcrumb(breadcrumb)
  }
}
