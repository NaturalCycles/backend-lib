import { RequestHandler } from 'express'

export interface DefaultAppCfg {
  /**
   * @default false
   */
  swaggerStatsEnabled?: boolean
  preHandlers?: RequestHandler[]
  handlers?: RequestHandler[]
  postHandlers?: RequestHandler[]
  resources?: Record<string, RequestHandler>
}
