import { Admin401ErrorData, HttpError } from '@naturalcycles/js-lib'
import { RequestHandler } from 'express'
import { AdminMiddleware, RequireAdminCfg, requireAdminPermissions } from './admin.mw'
import { BaseAdminService } from './base.admin.service'

export interface SecureHeaderMiddlewareCfg extends RequireAdminCfg {
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
  const requireAdmin = requireAdminPermissions(cfg.adminService, [], cfg)

  return async (req, res, next) => {
    const providedHeader = req.get('Authorization')

    // pass
    if (!cfg.adminService.cfg.authEnabled || providedHeader === cfg.secureHeader) return next()

    // Header provided - don't check for Admin
    if (providedHeader) {
      return next(
        new HttpError<Admin401ErrorData>('secureHeader or adminToken is required', {
          httpStatusCode: 401,
          adminAuthRequired: true,
        }),
      )
    }

    // Forward to AdminMiddleware (try Admin)
    requireAdmin(req, res, next)
  }
}
