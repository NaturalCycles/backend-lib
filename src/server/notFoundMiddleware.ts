import { getRequestEndpoint } from './request.util'
import type { BackendRequestHandler } from './server.model'

export function notFoundMiddleware(): BackendRequestHandler {
  return (req, res) => {
    res.status(404).send(`404 Not Found: ${getRequestEndpoint(req)}`)
  }
}
