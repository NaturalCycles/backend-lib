import { Server } from 'node:http'
import { SentrySharedService } from '../sentry/sentry.shared.service'
import { DefaultAppCfg } from './createDefaultApp.model'
import { BackendApplication } from './server.model'

/**
 * If DefaultAppCfg.resources is passed and `expressApp` is not passed - it will call createDefaultApp(cfg).
 */
export interface StartServerCfg extends DefaultAppCfg {
  /**
   * @default process.env.PORT || 8080
   */
  port?: number

  expressApp?: BackendApplication

  /**
   * Server will wait for promise to resolve until shutting down.
   * (with a timeout)
   */
  onShutdown?: () => Promise<void>

  /**
   * @default 3000
   */
  forceShutdownTimeout?: number

  sentryService?: SentrySharedService
}

export interface StartServerData {
  port: number
  server: Server
  /**
   * "Processed" server.address() as a string, ready to Cmd+click in MacOS Terminal
   */
  address: string
}
