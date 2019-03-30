import { memo } from '@naturalcycles/js-lib'
import * as SentryLib from '@sentry/node'
import { ErrorRequestHandler, RequestHandler } from 'express'
import { SentrySharedServiceCfg } from './sentry.model'

export class SentrySharedService {
  static INSTANCE_ALIAS = ['sentryService']

  constructor (private sentryServiceCfg: SentrySharedServiceCfg) {}

  init (): void {
    this.sentry()
  }

  @memo()
  sentry (): typeof SentryLib {
    // Lazy-loading `@sentry/node`
    // Reasons:
    // 1. Can be useful is this module is imported but never actually used
    // 2. Works around memory leak when used with Jest
    const Sentry = require('@sentry/node') as typeof SentryLib

    if (this.sentryServiceCfg.dsn) {
      // Sentry enabled
      console.log('SentryService init...')
    }

    Sentry.init({
      ...this.sentryServiceCfg,
    })

    return Sentry
  }

  getRequestHandler (): RequestHandler {
    return this.sentry().Handlers.requestHandler()
  }

  getErrorHandler (): ErrorRequestHandler {
    return this.sentry().Handlers.errorHandler()
  }

  /**
   * For GDPR reasons we never send more information than just User ID.
   */
  setUserId (id: string): void {
    this.sentry().configureScope(scope => {
      scope.setUser({
        id,
      })
    })
  }

  /**
   * Returns "eventId"
   */
  captureException (e: any): string | undefined {
    console.error(e)
    return this.sentry().captureException(e)
  }

  /**
   * Returns "eventId"
   */
  captureMessage (msg: string, level?: SentryLib.Severity): string | undefined {
    console.error(msg)
    return this.sentry().captureMessage(msg, level)
  }

  captureBreadcrumb (data: any): void {
    this.sentry().addBreadcrumb({
      data,
    })
  }
}
