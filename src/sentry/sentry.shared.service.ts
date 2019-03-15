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
    if (this.sentryServiceCfg.dsn) {
      // Sentry enabled
      console.log('SentryService init...')
    }

    SentryLib.init({
      dsn: this.sentryServiceCfg.dsn,
    })

    return SentryLib
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
