import { getGot, GetGotOptions } from '@naturalcycles/nodejs-lib'
import { Router } from 'express'
import { Got } from 'got'
import { Server } from 'http'
import { AddressInfo } from 'net'
import { createDefaultApp } from '../index'

export interface CloseableGot extends Got {
  close(): Promise<void>
}

/**
 * Creates Express App via `createDefaultApp()`.
 * Creates an http server on random free port, gets the port.
 * Creates a Got instance with prefixUrl set to localhost and given port.
 * Returns Got instance, extended with `.close()` method, that needs to be called to prevent memory leak.
 */
class ExpressTestService {
  async createAppWithResources(
    resources: Router[],
    opt: GetGotOptions = {},
    fn?: (app: CloseableGot) => Promise<any>,
  ): Promise<CloseableGot> {
    const app = createDefaultApp({
      resources,
    })

    const server = await new Promise<Server>((resolve, reject) => {
      const server = app.listen(0, '127.0.0.1', (err?: Error) => {
        if (err) return reject(err)
        resolve(server)
      })
    })
    const { address, port } = server.address() as AddressInfo
    // console.log({address, family, port})

    const got = getGot(opt).extend({
      // prefixUrl: `http://[::1]:${port}`,
      prefixUrl: `http://${address}:${port}`,
    }) as CloseableGot

    got.close = () => new Promise(resolve => server.close(resolve as any))

    if (fn) {
      await fn(got).finally(() => {
        return got.close()
      })
    }

    return got
  }
}

export const expressTestService = new ExpressTestService()
