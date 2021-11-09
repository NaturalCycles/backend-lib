import { _Memo } from '@naturalcycles/js-lib'
import { inspectAny } from '@naturalcycles/nodejs-lib'
import type { Breadcrumb, NodeOptions } from '@sentry/node'
import type * as SentryLib from '@sentry/node'
import { ErrorRequestHandler, RequestHandler } from 'express'
import { getRequestLogger } from '../index'

export interface SentrySharedServiceCfg extends NodeOptions {}

export class SentrySharedService {
  constructor(private sentryServiceCfg: SentrySharedServiceCfg) {}

  init(): void {
    this.sentry()
  }

  @_Memo()
  sentry(): typeof SentryLib {
    // Lazy-loading `@sentry/node`
    // Reasons:
    // 1. Can be useful is this module is imported but never actually used
    // 2. Works around memory leak when used with Jest
    const sentry = require('@sentry/node') as typeof SentryLib

    if (this.sentryServiceCfg.dsn) {
      // Sentry enabled
      console.log('SentryService init...')
    }

    sentry.init({
      maxValueLength: 2000, // default is 250 characters
      ...this.sentryServiceCfg,
    })

    return sentry
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
   * Does console.error(err)
   * Returns "eventId"
   */
  captureException(err: any, logError = true): string {
    // console.error(err)
    // Using request-aware logger here
    if (logError) {
      getRequestLogger().error('captureException:', err)
    }

    // This is to avoid Sentry cutting the err.message to 253 characters
    // It will log additional "breadcrumb object" before the error
    // It's a Breadcrumb, not a console.log, because console.log are NOT automatically attached as Breadcrumbs in cron-job environments (outside of Express)
    this.sentry().addBreadcrumb({
      message: inspectAny(err, {
        includeErrorData: true,
        colors: false,
      }),
      // data: (err as AppError).data, // included in message
    })

    return this.sentry().captureException(err)
  }

  /**
   * Returns "eventId"
   */
  captureMessage(msg: string, level?: SentryLib.Severity): string {
    getRequestLogger().error('captureMessage:', msg)
    return this.sentry().captureMessage(msg, level)
  }

  addBreadcrumb(breadcrumb: Breadcrumb): void {
    this.sentry().addBreadcrumb(breadcrumb)
  }
}
