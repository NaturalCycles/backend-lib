import { Server } from 'http'
import { Application } from 'express'

export interface StartServerCfg {
  /**
   * @default process.env.PORT || 8080
   */
  port?: number

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
  server: Server
  /**
   * "Processed" server.address() as a string, ready to Cmd+click in MacOS Terminal
   */
  address: string
}
