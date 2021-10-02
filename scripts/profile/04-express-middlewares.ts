import * as http from 'http'
import express = require('express')
import * as helmet from 'helmet'

/**
 * Based on: https://github.com/fastify/benchmarks/blob/master/benchmarks/express-with-middlewares.js
 */
export async function createServerExpressMiddlewares(): Promise<http.Server> {
  const app = express()
  app.disable('etag')
  app.disable('x-powered-by')

  app.use(express.json())
  app.use(require('cors')())
  app.use(helmet.dnsPrefetchControl())
  app.use(helmet.frameguard())
  app.use(helmet.hidePoweredBy())
  app.use(helmet.hsts())
  app.use(helmet.ieNoOpen())
  app.use(helmet.xssFilter())

  app.get('/', (req, res) => res.json({ hello: 'world' }))

  return http.createServer(app)
}
