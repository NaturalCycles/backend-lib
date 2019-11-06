import { RequestHandler } from 'express'

/**
 * Plain RequestHandler can be provided - then it's mounted to /
 * Otherwise `path` can be provided to specify mounting point.
 */
export type RequestHandlerCfg = RequestHandler | RequestHandlerWithPath

export interface RequestHandlerWithPath {
  path: string
  handler: RequestHandler
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
  preHandlers?: RequestHandlerCfg[]
  handlers?: RequestHandlerCfg[]
  resources?: RequestHandlerCfg[]
  postHandlers?: RequestHandlerCfg[]
}
