import http from 'node:http'
import express = require('express')
import helmet from 'helmet'
import cookieParser = require('cookie-parser')

/**
 * Based on: https://github.com/fastify/benchmarks/blob/master/benchmarks/express-with-middlewares.js
 */
export async function createServerExpressMiddlewares(): Promise<http.Server> {
  const app = express()
  app.disable('etag')
  app.disable('x-powered-by')

  app.use(cookieParser())
  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))
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
