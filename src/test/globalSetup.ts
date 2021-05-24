// tslint:disable:ordered-imports
const started = Date.now()

import { _since } from '@naturalcycles/js-lib'
import { Server } from 'http'
import { AddressInfo } from 'net'
import { createDefaultApp } from '..'
import { debugResource } from './debug.resource'

declare global {
  namespace NodeJS {
    interface Global {
      __EXPRESS_SERVER__: Server
    }

    interface ProcessEnv {
      __EXPRESS_SERVER_URL__: string
    }
  }
}

export default async (): Promise<void> => {
  const resources = [debugResource]

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
  const url = `http://${address}:${port}`

  process.env.__EXPRESS_SERVER_URL__ = url
  global.__EXPRESS_SERVER__ = server

  console.log(`\nglobalSetup.ts started ${url} in ${_since(started)}\n`)
}
