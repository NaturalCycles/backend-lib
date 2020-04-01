import { getGot } from '@naturalcycles/nodejs-lib'
import { Got } from 'got'
import { Server } from 'http'
import { AddressInfo } from 'net'
import { createDefaultApp, RequestHandlerCfg } from '..'

export interface ExpressApp extends Got {
  connect(): Promise<void>
  close(): Promise<void>
}

// Example:
// const app = expressTestService.createApp([ debugResource ])
// beforeAll(async () => {
//   await app.connect()
// })
// afterAll(async () => {
//   await app.close()
// })

class ExpressTestService {
  createApp(resources: RequestHandlerCfg[]): ExpressApp {
    const serverPromise = this.createTestServer(resources)

    const got = getGot().extend({
      prefixUrl: 'http://_call_connect_first:1234',
      responseType: 'json',
      mutableDefaults: true,
    }) as ExpressApp

    got.connect = async () => {
      const server = await serverPromise
      const { address, port } = server.address() as AddressInfo
      got.defaults.options.prefixUrl = `http://${address}:${port}`
    }

    got.close = async () => {
      const server = await serverPromise
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
   * const { address, port } = server.address() as AddressInfo
   * const url = `http://${address}:${port}`
   */
  async createTestServer(resources: RequestHandlerCfg[]): Promise<Server> {
    const app = createDefaultApp({
      resources,
    })

    return await new Promise<Server>((resolve, reject) => {
      const server = app.listen(0, '127.0.0.1', (err?: Error) => {
        if (err) return reject(err)
        resolve(server)
      })
    })
  }
}

export const expressTestService = new ExpressTestService()
