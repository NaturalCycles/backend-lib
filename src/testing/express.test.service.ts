import { getGot, Got } from '@naturalcycles/nodejs-lib'
import { Server } from 'http'
import { AddressInfo } from 'net'
import { createDefaultApp, RequestHandlerCfg } from '..'

interface DestroyableServer extends Server {
  destroy(): void
}

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
      // server.destroy()
      // await pDelay(1000)
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
  createTestServer(resources: RequestHandlerCfg[]): DestroyableServer {
    const app = createDefaultApp({
      resources,
    })

    // Important!
    // Only with this syntax `app.listen(0)` it allocates a port synchronously
    // Trying to specify a hostname will make server.address() return null.
    // This is how `supertest` is doing it.
    const server = app.listen(0) as DestroyableServer
    // enableDestroy(server)
    return server
  }
}

export const expressTestService = new ExpressTestService()

// function enableDestroy(server: DestroyableServer): void {
//   const connections: StringMap<Socket> = {}
//
//   server.on('connection', function(conn) {
//     const key = conn.remoteAddress + ':' + conn.remotePort;
//     connections[key] = conn;
//     console.log(`con created: ${key}, cons: ${Object.keys(connections).length}`)
//     conn.on('close', function() {
//       delete connections[key];
//       console.log(`con closed: ${key}, cons: ${Object.keys(connections).length}`)
//     });
//   });
//
//   server.destroy = function() {
//     for (let key in connections)
//       connections[key]!.destroy();
//   };
// }
