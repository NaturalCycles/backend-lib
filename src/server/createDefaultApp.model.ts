import { StringMap } from '@naturalcycles/js-lib'
import { RequestHandler } from 'express'

export interface DefaultAppCfg {
  swaggerStatsEnabled?: boolean
  preHandlers?: RequestHandler[]
  handlers?: RequestHandler[]
  postHandlers?: RequestHandler[]
  resources?: StringMap<RequestHandler>
}
