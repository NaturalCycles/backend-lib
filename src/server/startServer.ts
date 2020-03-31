import { memo } from '@naturalcycles/js-lib'
import { boldGrey, dimGrey, white } from '@naturalcycles/nodejs-lib/dist/colors'
import { ms } from '@naturalcycles/time-lib'
import { Server } from 'http'
import { log } from '../log'
import { StartServerCfg, StartServerData } from './startServer.model'

export class BackendServer {
  constructor(private cfg: StartServerCfg) {}

  server?: Server

  async start(): Promise<StartServerData> {
    const { bootstrapStartedAt = Date.now(), port: cfgPort, expressApp } = this.cfg

    // 1. Register error handlers, etc.
    process.on('uncaughtException', err => {
      log.error('uncaughtException:', err)
    })

    process.on('unhandledRejection', err => {
      log.error('unhandledRejection:', err)
    })

    process.once('SIGINT', () => this.stop())
    process.once('SIGTERM', () => this.stop())

    // sentryService.install()

    // 2. Start Express Server
    const port = Number(process.env.PORT) || cfgPort || 8080

    this.server = await new Promise<Server>((resolve, reject) => {
      const server = expressApp.listen(port, (err?: Error) => {
        if (err) return reject(err)
        resolve(server)
      })
    })

    // This is to fix GCP LoadBalancer race condition
    this.server.keepAliveTimeout = 600 * 1000 // 10 minutes

    const serverStartedAt = Date.now()

    const bootstrapMillis = serverStartedAt - bootstrapStartedAt
    log(
      `serverStarted on port ${white(String(port))}, bootstrapTime ${dimGrey(ms(bootstrapMillis))}`,
    )

    return {
      port,
      bootstrapStartedAt,
      serverStartedAt,
      bootstrapMillis,
      server: this.server,
    }
  }

  /**
   * Gracefully shuts down the server.
   * Does `process.exit()` in the end.
   */
  @memo()
  async stop(): Promise<void> {
    log(dimGrey(`Server shutdown...`))

    setTimeout(() => {
      log(boldGrey('Forceful shutdown after timeout'))
      process.exit(1)
    }, this.cfg.forceShutdownTimeout || 3000)

    if (this.cfg.onShutdown) {
      void this.cfg.onShutdown()
    }

    try {
      if (this.server) {
        await new Promise(r => this.server!.close(r))
      }
      log(dimGrey('Shutdown completed.'))
      process.exit(0)
    } catch (err) {
      log.error(err)
      process.exit(1)
    }
  }
}

/**
 * Convenience function.
 */
export async function startServer(cfg: StartServerCfg): Promise<StartServerData> {
  const server = new BackendServer(cfg)
  return await server.start()
}
