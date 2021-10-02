import * as http from 'http'
import express = require('express')

export async function createServerBareExpress(): Promise<http.Server> {
  const app = express()
  app.disable('etag')
  app.disable('x-powered-by')
  app.get('/', (req, res) => res.json({ hello: 'world' }))
  return http.createServer(app)
}
