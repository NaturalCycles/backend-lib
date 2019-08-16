import * as http from 'http'

export async function createServer (): Promise<http.Server> {
  return http.createServer((req, res) => {
    res.setHeader('content-type', 'application/json; charset=utf-8')
    res.end(JSON.stringify({ hello: 'world' }))
  })
}

// server.listen(8080)
