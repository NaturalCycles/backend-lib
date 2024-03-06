/*

yarn tsn validation.bench

 */

import http from 'node:http'
import { runCannon } from '@naturalcycles/bench-lib'
import { jsonSchema } from '@naturalcycles/js-lib'
import { objectSchema, stringSchema, runScript } from '@naturalcycles/nodejs-lib'
import express = require('express')
import { BackendApplication, validateBody, validateRequest } from '../src'

interface PwInput {
  pw: string
}

const pwInputSchema = objectSchema<PwInput>({
  pw: stringSchema.min(6),
})

function createApp(): BackendApplication {
  const app = express()
  app.disable('etag')
  app.disable('x-powered-by')
  app.use(express.json())
  return app
}

runScript(async () => {
  await runCannon(
    {
      '01-no-validation': async () => {
        const app = createApp()
        app.post('/', (req, res) => res.json({ hello: 'world' }))
        return http.createServer(app)
      },
      '02-ajv': async () => {
        const app = createApp()
        app.post(
          '/',
          validateBody(
            jsonSchema.object<PwInput>({
              pw: jsonSchema.string().min(6),
            }),
          ),
          (req, res) => res.json({ hello: 'world' }),
        )
        return http.createServer(app)
      },
      '03-joi': async () => {
        const app = createApp()
        app.post('/', (req, res) => {
          const _input = validateRequest.body(req, pwInputSchema)
          res.json({ hello: 'world' })
        })
        return http.createServer(app)
      },
    },
    {
      name: 'validation',
      runs: 2,
      // duration: 2,
      duration: 4,
      cooldown: 1,
      autocannonOptions: {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({ pw: '123456' }),
        expectBody: JSON.stringify({ hello: 'world' }),
      },
    },
  )
})
