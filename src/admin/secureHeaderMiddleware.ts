import { Admin401ErrorData, HttpError } from '@naturalcycles/js-lib'
import { BackendRequestHandler } from '../server/server.model'
import { AdminMiddleware, RequireAdminCfg, requireAdminPermissions } from './adminMiddleware'
import { BaseAdminService } from './base.admin.service'

export interface SecureHeaderMiddlewareCfg extends RequireAdminCfg {
  adminService: BaseAdminService

  /**
   * Defaults to `Authorization`
   */
  secureHeaderKey?: string

  secureHeaderValue: string
}

/**
 * Secures the endpoint by requiring a secret header to be present.
 * Throws Error401Admin otherwise.
 */
export function createSecureHeaderMiddleware(cfg: SecureHeaderMiddlewareCfg): AdminMiddleware {
  return reqPermissions => requireSecureHeaderOrAdmin(cfg, reqPermissions)
}

function requireSecureHeaderOrAdmin(
  cfg: SecureHeaderMiddlewareCfg,
  reqPermissions?: string[],
): BackendRequestHandler {
  const { secureHeaderKey = 'Authorization' } = cfg

  const requireAdmin = requireAdminPermissions(cfg.adminService, reqPermissions, cfg)

  return async (req, res, next) => {
    const providedHeader = req.get(secureHeaderKey)

    // pass
    if (!cfg.adminService.cfg.authEnabled || providedHeader === cfg.secureHeaderValue) return next()

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
