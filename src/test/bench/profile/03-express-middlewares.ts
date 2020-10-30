import express = require('express')
import * as http from 'http'

/**
 * Based on: https://github.com/fastify/benchmarks/blob/master/benchmarks/express-with-middlewares.js
 */
export async function createServer(): Promise<http.Server> {
  const app = express()
  app.disable('etag')
  app.disable('x-powered-by')

  app.use(require('cors')())
  app.use(require('dns-prefetch-control')())
  app.use(require('frameguard')())
  app.use(require('hide-powered-by')())
  app.use(require('hsts')())
  app.use(require('ienoopen')())
  app.use(require('x-xss-protection')())

  app.get('/', (req, res) => res.json({ hello: 'world' }))

  return http.createServer(app)
}
