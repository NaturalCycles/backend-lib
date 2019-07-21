import { Application } from 'express'

export interface StartServerCfg {
  /**
   * @default process.env.PORT || 8080
   */
  port?: number

  /**
   * Unix millisecond timestamp of when bootstrap has started.
   * @default to Date.now()
   */
  bootstrapStartedAt?: number

  expressApp: Application
}

export interface StartServerData {
  port: number
  bootstrapStartedAt: number
  serverStartedAt: number
  bootstrapMillis: number
}
