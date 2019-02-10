import { memo } from '@naturalcycles/js-lib'
import { Application } from 'express'
import { Server } from 'http'
import { serverSharedService } from './server.shared.service'

export interface BootstrapSharedServiceCfg {
  port: number

  app: Application
}

/**
 * Server bootstrapping sequence. Called from `startServer.ts`
 */
export class BootstrapSharedService {
  constructor (public cfg: BootstrapSharedServiceCfg) {}

  server!: Server
  serverStarted!: number
  bootstrapStarted?: number

  /**
   * Starts HTTP Server.
   */
  async startServer (bootstrapStarted: number): Promise<void> {
    this.bootstrapStarted = bootstrapStarted

    // 1. Register error handlers, etc.
    this.prepare()

    // 2. Start Express Server
    const { app, port } = this.cfg
    this.server = await serverSharedService.startServer(app, port)
    this.serverStarted = Date.now()

    const bootstrapTime = this.serverStarted - bootstrapStarted
    console.log(`serverStarted on port ${port}, bootstrapTime: ${bootstrapTime} ms`)
  }

  /**
   * Register error handlers, etc.
   */
  private prepare (): void {
    process.on('uncaughtException', err => {
      console.error('uncaughtException', err)
      // sentryService.captureException(err)
    })

    process.on('unhandledRejection', err => {
      console.error('unhandledRejection', err)
      // sentryService.captureException(err)
    })

    process.once('SIGINT', () => this.stopServer())
    process.once('SIGTERM', () => this.stopServer())

    // sentryService.install() // todo: new universal sentry sdk
  }

  /**
   * Gracefully shuts down the server.
   * Does `process.exit()` in the end.
   */
  @memo()
  async stopServer (): Promise<void> {
    setTimeout(() => {
      console.error('Forcefully shutting down after timeout...')
      process.exit(1)
    }, 3000)

    try {
      await Promise.all([serverSharedService.stopServer(this.server)])

      console.log('Gracefully shut down')
      process.exit(0)
    } catch (err) {
      console.error(err)
      process.exit(1)
    }
  }
}
