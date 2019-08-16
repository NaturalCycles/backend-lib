import { StringMap } from '@naturalcycles/js-lib'
import { RequestHandler } from 'express'

export interface DefaultAppCfg {
  /**
   * @default false
   */
  swaggerStatsEnabled?: boolean
  preHandlers?: RequestHandler[]
  handlers?: RequestHandler[]
  postHandlers?: RequestHandler[]
  resources?: StringMap<RequestHandler>
}
