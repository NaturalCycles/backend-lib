import {
  _anyToError,
  _isNotEmpty,
  _Memo,
  AppError,
  CommonLogger,
  CommonLogLevel,
  ErrorData,
} from '@naturalcycles/js-lib'
import { inspectAny, InspectAnyOptions } from '@naturalcycles/nodejs-lib'
import type { Breadcrumb, NodeOptions, SeverityLevel } from '@sentry/node'
import type * as SentryLib from '@sentry/node'
import { BackendErrorRequestHandler, BackendRequestHandler, getRequestLogger } from '../index'

export interface SentrySharedServiceCfg extends NodeOptions {}

const sentrySeverityMap: Record<SeverityLevel, CommonLogLevel> = {
  debug: 'log',
  info: 'log',
  log: 'log',
  warning: 'warn',
  error: 'error',
  fatal: 'error',
}

const INSPECT_OPT: InspectAnyOptions = {
  colors: false,
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
   * Does console.log(err)
   * Returns "eventId" or undefined (if error was not reported).
   */
  captureException(err_: any, logError = true): string | undefined {
    // normalize the error
    const err = _anyToError(err_)
    const data = err instanceof AppError ? (err.data as ErrorData) : undefined

    // Using request-aware logger here
    if (logError) {
      // Log both the error and attached ErrorData (if any)
      getRequestLogger().error('captureException:', ...[err_, data].filter(Boolean))
    }

    if (data?.report === false) {
      // Skip reporting the error
      return
    }

    if (data?.reportRate) {
      const reportRate = (err as AppError).data.reportRate!
      // E.g rate of 0.1 means 10% of errors are reported
      if (Math.random() > reportRate) return
    }

    // This is to avoid Sentry cutting err.message to 253 characters
    // It will log additional "breadcrumb object" before the error
    // It's a Breadcrumb, not a console.log, because console.log are NOT automatically attached as Breadcrumbs in cron-job environments (outside of Express)
    this.sentry().addBreadcrumb({
      message: [err, data]
        .filter(_isNotEmpty)
        .map(a => inspectAny(a, INSPECT_OPT))
        .join('\n'),
    })

    return this.sentry().captureException(err)
  }

  /**
   * Returns "eventId"
   */
  captureMessage(msg: string, level?: SeverityLevel): string {
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
        const message = args.map(arg => inspectAny(arg, INSPECT_OPT)).join(' ')

        this.sentry().addBreadcrumb({
          message,
        })

        this.sentry().captureException(_anyToError(args.length === 1 ? args[0] : args))
      },
    }
  }
}
