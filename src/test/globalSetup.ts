const started = Date.now() as UnixTimestampMillis

import { Server } from 'node:http'
import { AddressInfo } from 'node:net'
import { _since, UnixTimestampMillis } from '@naturalcycles/js-lib'
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

/* eslint-disable import-x/no-anonymous-default-export, unicorn/no-anonymous-default-export */
// biome-ignore lint/style/noDefaultExport: ok
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
  // @ts-expect-error
  global['__EXPRESS_SERVER__'] = server

  console.log(`\nglobalSetup.ts started ${url} in ${_since(started)}\n`)
}
