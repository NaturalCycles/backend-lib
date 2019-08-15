import { RequestHandler } from 'express'

export function notFoundHandler (): RequestHandler {
  return (req, res) => {
    res
      .contentType('text/plain')
      .status(404)
      .send('404 Not Found: ' + req.url)
  }
}
