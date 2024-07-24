import {
  _anyToError,
  _isErrorObject,
  _Memo,
  CommonLogger,
  CommonLogLevel,
  Primitive,
  StringMap,
} from '@naturalcycles/js-lib'
import { _inspect, InspectAnyOptions } from '@naturalcycles/nodejs-lib'
// eslint-disable-next-line import/no-duplicates
import type { Breadcrumb, NodeOptions, SeverityLevel } from '@sentry/node'
// eslint-disable-next-line import/no-duplicates
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
  includeErrorData: true,
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
  setUserId(id: string | null): void {
    if (id === null) {
      this.sentry().setUser(null)
      return
    }

    this.sentry().setUser({
      id,
    })
  }

  /**
   * Tag keys have a maximum length of 32 characters and can contain only
   * letters (a-zA-Z), numbers (0-9), underscores (_), periods (.), colons (:), and dashes (-).
   *
   * Tag values have a maximum length of 200 characters and they
   * cannot contain the newline (\n) character.
   *
   * https://docs.sentry.io/platforms/node/enriching-events/scopes/
   */
  setTags(tags: StringMap<Primitive>): void {
    this.sentry().setTags(tags)
  }

  /**
   * Does console.log(err)
   * Returns "eventId" or undefined (if error was not reported).
   */
  captureException(err_: any, logError = true): string | undefined {
    // normalize the error
    const err = _anyToError(err_)
    const data = _isErrorObject(err) ? err.data : undefined

    // Using request-aware logger here
    if (logError) {
      // Log both the error and attached ErrorData (if any)
      getRequestLogger().error('captureException:', ...[err_, data].filter(Boolean))
    }

    if (data?.report === false) {
      // Skip reporting the error
      return
    }

    if (
      data?.reportRate && // E.g rate of 0.1 means 10% of errors are reported
      Math.random() > data.reportRate
    ) {
      return
    }

    // This is to avoid Sentry cutting err.message to 253 characters
    // It will log additional "breadcrumb object" before the error
    // It's a Breadcrumb, not a console.log, because console.log are NOT automatically attached as Breadcrumbs in cron-job environments (outside of Express)
    this.sentry().addBreadcrumb({
      message: _inspect(err, INSPECT_OPT),
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
        const message = args.map(arg => _inspect(arg, INSPECT_OPT)).join(' ')

        this.sentry().addBreadcrumb({
          message,
        })

        this.sentry().captureException(_anyToError(args.length === 1 ? args[0] : args))
      },
    }
  }
}
