import type { BackendRequestHandler } from './server.model'

export function okMiddleware(): BackendRequestHandler {
  return (_req, res) => {
    res.json({ ok: 1 })
  }
}
