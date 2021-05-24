import { Application } from 'express'
import { Server } from 'http'

export interface StartServerCfg {
  /**
   * @default process.env.PORT || 8080
   */
  port?: number

  /**
   * Unix millisecond timestamp of when bootstrap has started.
   *
   * @default to Date.now()
   */
  bootstrapStartedAt?: number

  expressApp: Application

  /**
   * Server will wait for promise to resolve until shutting down.
   * (with a timeout)
   */
  onShutdown?: () => Promise<void>

  /**
   * @default 3000
   */
  forceShutdownTimeout?: number
}

export interface StartServerData {
  port: number
  bootstrapStartedAt: number
  serverStartedAt: number
  bootstrapMillis: number
  server: Server
}
