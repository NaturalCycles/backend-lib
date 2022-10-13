import { Options, OptionsJson, OptionsUrlencoded } from 'body-parser'
import { CorsOptions } from 'cors'
import { SentrySharedService } from '../sentry/sentry.shared.service'
import { BackendRequestHandler } from './server.model'
import { GenericErrorMiddlewareCfg } from './genericErrorMiddleware'

/**
 * Plain RequestHandler can be provided - then it's mounted to /
 * Otherwise `path` can be provided to specify mounting point.
 */
export type BackendRequestHandlerCfg = BackendRequestHandler | BackendRequestHandlerWithPath

export interface BackendRequestHandlerWithPath {
  path: string
  handler: BackendRequestHandler
}

/**
 * Handlers are used in this order:
 *
 * 1. preHandlers
 * 2. handlers
 * 3. resources
 * 4. postHandlers
 */
export interface DefaultAppCfg {
  genericErrorMwCfg?: GenericErrorMiddlewareCfg
  preHandlers?: BackendRequestHandlerCfg[]
  handlers?: BackendRequestHandlerCfg[]
  resources?: BackendRequestHandlerCfg[]
  postHandlers?: BackendRequestHandlerCfg[]

  sentryService?: SentrySharedService

  bodyParserJsonOptions?: OptionsJson
  bodyParserUrlEncodedOptions?: OptionsUrlencoded
  bodyParserRawOptions?: Options

  corsOptions?: CorsOptions
}
