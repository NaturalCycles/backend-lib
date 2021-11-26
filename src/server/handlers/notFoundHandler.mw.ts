import { getRequestEndpoint } from '../request.util'
import { BackendRequestHandler } from '../server.model'

export function notFoundHandler(): BackendRequestHandler {
  return (req, res) => {
    res.status(404).send(`404 Not Found: ${getRequestEndpoint(req)}`)
  }
}
