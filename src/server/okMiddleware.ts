import { BackendRequestHandler } from './server.model'

export function okMiddleware(): BackendRequestHandler {
  return (req, res) => {
    res.json({ ok: 1 })
  }
}
