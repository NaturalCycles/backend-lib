import { Server } from 'http'
import { StartServerCfg, StartServerData } from './startServer.model'

export class BackendServer {
  constructor (private cfg: StartServerCfg) {}

  server?: Server

  async start (): Promise<StartServerData> {
    const { bootstrapStartedAt = Date.now(), port: cfgPort, expressApp } = this.cfg

    // 1. Register error handlers, etc.
    process.on('uncaughtException', err => {
      console.error('uncaughtException', err)
    })

    process.on('unhandledRejection', err => {
      console.error('unhandledRejection', err)
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

    const serverStartedAt = Date.now()

    const bootstrapMillis = serverStartedAt - bootstrapStartedAt
    console.log(`serverStarted on port ${port}, bootstrapTime: ${bootstrapMillis} ms`)

    return {
      port,
      bootstrapStartedAt,
      serverStartedAt,
      bootstrapMillis,
    }
  }

  /**
   * Gracefully shuts down the server.
   * Does `process.exit()` in the end.
   */
  async stop (): Promise<void> {
    setTimeout(() => {
      console.error('Forcefully shutting down after timeout...')
      process.exit(1)
    }, 3000)

    try {
      if (this.server) {
        await new Promise(r => this.server!.close(r))
      }
      console.log('Gracefully shut down')
      process.exit(0)
    } catch (err) {
      console.error(err)
      process.exit(1)
    }
  }
}

/**
 * Convenience function.
 */
export async function startServer (cfg: StartServerCfg): Promise<StartServerData> {
  const server = new BackendServer(cfg)
  return server.start()
}
