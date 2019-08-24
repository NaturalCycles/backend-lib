import { RequestHandler } from 'express'

export function okHandler (): RequestHandler {
  return (req, res) => {
    res.json({ ok: 1 })
  }
}
