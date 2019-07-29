import { RequestHandler } from 'express'

export function notFoundHandler (): RequestHandler {
  return (req, res) => {
    console.log(`404: ${req.url}`)

    res
      .contentType('text/plain')
      .status(404)
      .send('404 Not Found: ' + req.url)
  }
}
