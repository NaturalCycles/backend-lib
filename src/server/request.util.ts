import { Request } from 'express'

export function getRequestEndpoint(req: Request): string {
  let path = (req.baseUrl + (req.route?.path || req.path)).toLowerCase()
  if (path.length > 1 && path.endsWith('/')) {
    path = path.slice(0, path.length - 1)
  }

  return [req.method, path].join(' ')
}
