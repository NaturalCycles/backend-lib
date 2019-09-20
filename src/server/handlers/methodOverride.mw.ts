import { RequestHandler } from 'express'

export interface MethodOverrideCfg {
  /**
   * @default _method
   */
  methodKey?: string
}

export function methodOverride(cfg: MethodOverrideCfg = {}): RequestHandler {
  const { methodKey } = {
    methodKey: '_method',
    ...cfg,
  }

  return (req, res, next) => {
    if (req.query[methodKey]) {
      req.method = req.query[methodKey]
      // delete req.query[methodKey]
    }

    next()
  }
}
