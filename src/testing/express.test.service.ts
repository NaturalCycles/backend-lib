import { getGot } from '@naturalcycles/nodejs-lib'
import { Got } from 'got'
import { Server } from 'http'
import { AddressInfo } from 'net'
import { createDefaultApp, RequestHandlerCfg } from '..'

export interface ExpressApp extends Got {
  close(): Promise<void>
}

// Example:
// const app = expressTestService.createApp([ debugResource ])
// afterAll(async () => {
//   await app.close()
// })

class ExpressTestService {
  createApp(resources: RequestHandlerCfg[]): ExpressApp {
    const server = this.createTestServer(resources)
    const { port } = server.address() as AddressInfo
    const prefixUrl = `http://127.0.0.1:${port}`

    const got = getGot().extend({
      prefixUrl,
      responseType: 'json',
      mutableDefaults: true,
    }) as ExpressApp

    got.close = async () => {
      await new Promise(resolve => server.close(resolve))
    }

    return got
  }

  // Too easy:(
  // getGot(opt: GetGotOptions = {}): Got {
  //   return getGot(opt).extend({
  //     prefixUrl: process.env.__EXPRESS_SERVER_URL__,
  //   })
  // }

  /**
   * Creates a "Default Express App" with provided resources.
   * Starts an http server on '127.0.0.1' and random available port.
   *
   * To get a server url:
   * const { port } = server.address() as AddressInfo
   * const url = `http://127.0.0.1:${port}`
   */
  createTestServer(resources: RequestHandlerCfg[]): Server {
    const app = createDefaultApp({
      resources,
    })

    // Important!
    // Only with this syntax `app.listen(0)` it allocates a port synchronously
    // Trying to specify a hostname will make server.address() return null.
    // This is how `supertest` is doing it.
    return app.listen(0)
  }
}

export const expressTestService = new ExpressTestService()
