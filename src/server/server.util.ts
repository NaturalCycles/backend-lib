import { Server } from 'http'

export interface DestroyableServer extends Server {
  destroy(): Promise<void>
}

/**
 * Based on: https://github.com/isaacs/server-destroy/blob/master/index.js
 *
 * @experimental
 */
export function enableDestroy(server: Server): DestroyableServer {
  const connections = {}
  const srv = server as DestroyableServer

  srv.on('connection', function (conn) {
    const key = conn.remoteAddress + ':' + conn.remotePort
    connections[key] = conn
    conn.on('close', () => delete connections[key])
  })

  srv.destroy = async () => {
    // let started = Date.now()
    const p = new Promise(resolve => server.close(resolve))
    for (const key of Object.keys(connections)) {
      connections[key].destroy()
    }
    await p
    // console.log(`destroyed ${Object.keys(connections).length} con(s) in ${_since(started)}`)
  }

  return srv
}
