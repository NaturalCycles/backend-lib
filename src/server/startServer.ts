import { Server } from 'http'
import { _Memo, _ms } from '@naturalcycles/js-lib'
import { boldGrey, dimGrey, white } from '@naturalcycles/nodejs-lib/dist/colors'
import { log } from '../log'
import { StartServerCfg, StartServerData } from './startServer.model'

export class BackendServer {
  constructor(private cfg: StartServerCfg) {}

  server?: Server

  async start(): Promise<StartServerData> {
    const { port: cfgPort, expressApp } = this.cfg

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
    const port = Number(process.env['PORT']) || cfgPort || 8080

    this.server = await new Promise<Server>((resolve, reject) => {
      const server = expressApp.listen(port, (err?: Error) => {
        if (err) return reject(err)
        resolve(server)
      })
    })

    // This is to fix GCP LoadBalancer race condition
    this.server.keepAliveTimeout = 600 * 1000 // 10 minutes

    let address = `http://localhost:${port}` // default

    const addr = this.server.address()
    if (addr) {
      if (typeof addr === 'string') {
        address = addr
      } else if (addr.address !== '::') {
        address = `http://${addr.address}:${port}`
      }
    }

    log(`serverStarted on ${white(address)} in ${dimGrey(_ms(process.uptime() * 1000))}`)

    return {
      port,
      server: this.server,
      address,
    }
  }

  /**
   * Gracefully shuts down the server.
   * Does `process.exit()` in the end.
   */
  @_Memo()
  async stop(): Promise<void> {
    log(dimGrey(`Server shutdown...`))

    setTimeout(() => {
      log(boldGrey('Forceful shutdown after timeout'))
      process.exit(1)
    }, this.cfg.forceShutdownTimeout || 3000)

    void this.cfg.onShutdown?.()

    try {
      if (this.server) {
        await new Promise(r => this.server!.close(r))
      }
      log(dimGrey('Shutdown completed.'))
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
export async function startServer(cfg: StartServerCfg): Promise<StartServerData> {
  const server = new BackendServer(cfg)
  return await server.start()
}
