import { BackendRequestHandler } from '../server.model'

export interface MethodOverrideCfg {
  /**
   * @default _method
   */
  methodKey?: string
}

export function methodOverride(cfg: MethodOverrideCfg = {}): BackendRequestHandler {
  const { methodKey } = {
    methodKey: '_method',
    ...cfg,
  }

  return (req, res, next) => {
    if (req.query[methodKey]) {
      req.method = req.query[methodKey] as string
      // delete req.query[methodKey]
    }

    next()
  }
}
