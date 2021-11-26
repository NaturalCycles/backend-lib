import { Server } from 'http'
import { AddressInfo } from 'net'
import { getGot, Got } from '@naturalcycles/nodejs-lib'
import { BackendApplication, createDefaultApp } from '../index'
import { BackendRequestHandlerCfg } from '../server/createDefaultApp.model'

export interface ExpressApp extends Got {
  close(): Promise<void>
}

// Example:
// const app = expressTestService.createApp([ debugResource ])
// afterAll(async () => {
//   await app.close()
// })

class ExpressTestService {
  createAppFromResource(resource: BackendRequestHandlerCfg): ExpressApp {
    return this.createApp(
      createDefaultApp({
        resources: [resource],
      }),
    )
  }

  createAppFromResources(resources: BackendRequestHandlerCfg[]): ExpressApp {
    return this.createApp(
      createDefaultApp({
        resources,
      }),
    )
  }

  createApp(app: BackendApplication): ExpressApp {
    const server = this.createTestServer(app)
    const { port } = server.address() as AddressInfo
    const prefixUrl = `http://127.0.0.1:${port}`

    const got = getGot({
      prefixUrl,
      responseType: 'json',
      retry: 0,
    }) as ExpressApp

    got.close = async () => {
      await new Promise(resolve => server.close(resolve))
      // server.destroy()
      // await pDelay(1000)
    }

    return got
  }

  /**
   * Creates a "Default Express App" with provided resources.
   * Starts an http server on '127.0.0.1' and random available port.
   *
   * To get a server url:
   * const { port } = server.address() as AddressInfo
   * const url = `http://127.0.0.1:${port}`
   */
  private createTestServer(app: BackendApplication): Server {
    // Important!
    // Only with this syntax `app.listen(0)` it allocates a port synchronously
    // Trying to specify a hostname will make server.address() return null.
    // This is how `supertest` is doing it.
    const server = app.listen(0)
    // enableDestroy(server)
    return server
  }
}

export const expressTestService = new ExpressTestService()
