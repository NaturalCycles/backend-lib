import { getGot } from '@naturalcycles/nodejs-lib'
import { Got } from 'got'
import { Server } from 'http'
import { AddressInfo } from 'net'
import { createDefaultApp, RequestHandlerCfg } from '..'

export interface CloseableGot extends Got {
  close(): Promise<void>
}

class ExpressTestService {
  async getGot(resources: RequestHandlerCfg[]): Promise<CloseableGot> {
    const server = await this.createTestServer(resources)
    const { address, port } = server.address() as AddressInfo

    const got = getGot().extend({
      prefixUrl: `http://${address}:${port}`,
    }) as CloseableGot

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
