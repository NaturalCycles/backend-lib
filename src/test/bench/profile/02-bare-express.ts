import express = require('express')
import * as http from 'http'

export async function createServer(): Promise<http.Server> {
  const app = express()
  app.disable('etag')
  app.get('/', (req, res) => res.json({ hello: 'world' }))
  return http.createServer(app)
}
