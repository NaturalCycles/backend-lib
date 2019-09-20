import { HttpError } from '@naturalcycles/js-lib'
import { RequestHandler } from 'express'
import { AdminMiddleware } from './admin.mw'
import { BaseAdminService } from './base.admin.service'

export interface SecureHeaderMiddlewareCfg {
  adminService: BaseAdminService
  secureHeader: string
}

/**
 * Secures the endpoint by requiring a secret header to be present.
 * Throws Error401Admin otherwise.
 */
export function createSecureHeaderMiddleware(cfg: SecureHeaderMiddlewareCfg): AdminMiddleware {
  return () => requireSecureHeaderOrAdmin(cfg)
}

function requireSecureHeaderOrAdmin(cfg: SecureHeaderMiddlewareCfg): RequestHandler {
  return async (req, _res, next) => {
    if (!cfg.adminService.cfg.authEnabled) return next()

    if (req.get('Authorization') !== cfg.secureHeader) {
      if (await cfg.adminService.isAdmin(req)) return next() // allow admins to login

      return next(
        new HttpError('secureHeader or adminToken is required', {
          httpStatusCode: 401,
          adminAuthRequired: true,
        }),
      )
    }

    next()
  }
}
