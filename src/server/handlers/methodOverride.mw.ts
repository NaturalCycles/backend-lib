import { RequestHandler } from 'express'

export function methodOverride (): RequestHandler {
  return (req, res, next) => {
    req.method = req.query._method || req.method
    next()
  }
}
