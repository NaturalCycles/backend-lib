import { BackendRequestHandler } from '../server.model'

export function okHandler(): BackendRequestHandler {
  return (req, res) => {
    res.json({ ok: 1 })
  }
}
