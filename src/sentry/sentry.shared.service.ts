import { _anyToError, _Memo, CommonLogger, CommonLogLevel } from '@naturalcycles/js-lib'
import { inspectAny, inspectAnyStringifyFn } from '@naturalcycles/nodejs-lib'
import { Severity } from '@sentry/node'
import type { Breadcrumb, NodeOptions } from '@sentry/node'
import type * as SentryLib from '@sentry/node'
import { BackendErrorRequestHandler, BackendRequestHandler, getRequestLogger } from '../index'

export interface SentrySharedServiceCfg extends NodeOptions {}

const sentrySeverityMap: Record<Severity, CommonLogLevel> = {
  [Severity.Debug]: 'log',
  [Severity.Log]: 'log',
  [Severity.Info]: 'log',
  [Severity.Warning]: 'warn',
  [Severity.Error]: 'error',
  [Severity.Critical]: 'error',
  [Severity.Fatal]: 'error',
}

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

  /**
   * Currently not recommended, because it makes `void` requests throw user-facing errors.
   *
   * UPD: to be tested. Without it - request is not enriched and the error is less useful.
   */
  getRequestHandler(): BackendRequestHandler {
    return this.sentry().Handlers.requestHandler()
  }

  /**
   * Currently not recommended, as it's replaced by our custom sentryErrorHandler.
   *
   * @deprecated
   */
  getErrorHandler(): BackendErrorRequestHandler {
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

    return this.sentry().captureException(
      _anyToError(err, Error, {
        stringifyFn: inspectAnyStringifyFn,
      }),
    )
  }

  /**
   * Returns "eventId"
   */
  captureMessage(msg: string, level?: Severity): string {
    getRequestLogger()[sentrySeverityMap[level!] || 'log']('captureMessage:', msg)
    return this.sentry().captureMessage(msg, level)
  }

  addBreadcrumb(breadcrumb: Breadcrumb): void {
    this.sentry().addBreadcrumb(breadcrumb)
  }

  /**
   * Currently it will only use `logger.error` ("error" level) and ignore `log` and `warn`.
   *
   * For each `logger.error` - it'll do a captureException.
   *
   * @experimental
   */
  getCommonLogger(): CommonLogger {
    return {
      log: () => {}, // noop
      warn: () => {}, // noop
      error: (...args) => {
        const message = args
          .map(arg =>
            inspectAny(arg, {
              includeErrorData: true,
              colors: false,
            }),
          )
          .join(' ')

        this.sentry().addBreadcrumb({
          message,
        })

        this.sentry().captureException(
          _anyToError(args.length === 1 ? args[0] : args, Error, {
            stringifyFn: inspectAnyStringifyFn,
          }),
        )
      },
    }
  }
}
