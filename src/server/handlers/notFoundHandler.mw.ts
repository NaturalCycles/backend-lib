import { RequestHandler } from 'express'
import { log } from '../../log'

export function notFoundHandler (): RequestHandler {
  return (req, res) => {
    log(`404: ${req.url}`)

    res
      .contentType('text/plain')
      .status(404)
      .send('404 Not Found: ' + req.url)
  }
}
