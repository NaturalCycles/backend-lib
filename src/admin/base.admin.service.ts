import {
  Admin401ErrorData,
  Admin403ErrorData,
  HttpError,
  _anyToErrorMessage,
} from '@naturalcycles/js-lib'
import { Debug } from '@naturalcycles/nodejs-lib'
import { dimGrey, green, red } from '@naturalcycles/nodejs-lib/dist/colors'
import { Request } from 'express'
import type * as FirebaseAdmin from 'firebase-admin'

const log = Debug('nc:backend-lib:admin')

export interface AdminServiceCfg {
  /**
   * @default 'admin_token'
   */
  adminTokenKey?: string

  /**
   * If false - disables auth completely (useful for debugging locally, but never in production).
   * @default true
   */
  authEnabled?: boolean
}

export interface AdminInfo {
  email: string
  permissions: string[]
}

const adminInfoDisabled = (): AdminInfo => ({
  email: 'authDisabled',
  permissions: [],
})

/**
 * Base implementation based on Firebase Auth tokens passed as 'admin_token' cookie.
 */
export class BaseAdminService {
  constructor(private firebaseAuth: FirebaseAdmin.auth.Auth, cfg: AdminServiceCfg) {
    this.cfg = {
      adminTokenKey: 'admin_token',
      authEnabled: true,
      ...cfg,
    }
  }

  cfg!: Required<AdminServiceCfg>

  adminInfoDisabled(): AdminInfo {
    return {
      email: 'authDisabled',
      permissions: [],
    }
  }

  /**
   * To be extended.
   *
   * Returns undefined if it's not an Admin.
   * Otherwise returns Set of permissions.
   * Empty array means it IS and Admin, but has no permissions (except being an Admin).
   */
  getEmailPermissions(email?: string): Set<string> | undefined {
    if (!email) return
    log(
      `getEmailPermissions (${dimGrey(
        email,
      )}) returning undefined (please override the implementation)`,
    )
    return
  }

  /**
   * To be extended.
   */
  protected async onPermissionCheck(
    req: Request,
    email: string,
    reqPermissions: string[],
    required: boolean,
    granted: boolean,
    meta: Record<string, any> = {},
  ): Promise<void> {
    log(
      `${dimGrey(email)} ${required ? 'required' : 'optional'} permissions check [${dimGrey(
        reqPermissions.join(', '),
      )}]: ${granted ? green('GRANTED') : red('DENIED')}`,
      meta,
    )
  }

  async getEmailByToken(adminToken?: string): Promise<string | undefined> {
    if (!adminToken) return

    try {
      const decodedToken = await this.firebaseAuth.verifyIdToken(adminToken)
      const email = decodedToken?.email
      log(`admin email: ${dimGrey(email)}`)
      return email
    } catch (err) {
      log(`getEmailByToken error: ${_anyToErrorMessage(err)}`)
      return
    }
  }

  /**
   * Current implementation is based on req=Request (from Express).
   * Override if needed.
   */
  async getAdminToken(req: Request): Promise<string | undefined> {
    return (
      (req.cookies || {})[this.cfg.adminTokenKey] ||
      req.header(this.cfg.adminTokenKey) ||
      req.header('x-admin-token')
    )
  }

  async isAdmin(req: Request): Promise<boolean> {
    const adminToken = await this.getAdminToken(req)
    const email = await this.getEmailByToken(adminToken)
    return !!this.getEmailPermissions(email)
  }

  async getAdminInfo(req: Request): Promise<AdminInfo | undefined> {
    return await this.hasPermissions(req)
  }

  // alias
  // async reqAdmin (req: Request): Promise<void> {
  //   await this.reqPermissions(req)
  // }

  /**
   * Returns AdminInfo if it has all required permissions.
   * Otherwise returns undefined
   */
  async hasPermissions(
    req: Request,
    reqPermissions: string[] = [],
    meta: Record<string, any> = {},
  ): Promise<AdminInfo | undefined> {
    if (!this.cfg.authEnabled) return adminInfoDisabled()

    const adminToken = await this.getAdminToken(req)
    const email = await this.getEmailByToken(adminToken)
    const hasPermissions = this.getEmailPermissions(email)
    if (!hasPermissions) return

    const granted = reqPermissions.every(p => hasPermissions.has(p))

    void this.onPermissionCheck(req, email!, reqPermissions, false, granted, meta)

    if (!granted) return

    return {
      email: email!,
      permissions: [...hasPermissions],
    }
  }

  async requirePermissions(
    req: Request,
    reqPermissions: string[] = [],
    meta: Record<string, any> = {},
    andComparison: boolean = true,
  ): Promise<AdminInfo> {
    if (!this.cfg.authEnabled) return adminInfoDisabled()

    const adminToken = await this.getAdminToken(req)
    const email = await this.getEmailByToken(adminToken)

    if (!email) {
      throw new HttpError<Admin401ErrorData>('adminToken required', {
        adminAuthRequired: true,
        httpStatusCode: 401,
        userFriendly: true,
      })
    }

    const hasPermissions = this.getEmailPermissions(email)
    const grantedPermissions = hasPermissions
      ? reqPermissions.filter(p => hasPermissions.has(p))
      : []

    let granted = false
    if (andComparison) {
      granted = !!hasPermissions && grantedPermissions.length === reqPermissions.length // All permissions granted
      void this.onPermissionCheck(req, email, reqPermissions, true, granted, meta)
    } else {
      granted = !!hasPermissions && grantedPermissions.length > 0
      if (granted) {
        // Require the permission(s), but only the ones the user was actually granted. 1+ is required
        void this.onPermissionCheck(req, email, grantedPermissions, true, granted, meta)
      } else {
        void this.onPermissionCheck(req, email, reqPermissions, true, granted, meta)
      }
    }

    if (!granted) {
      throw new HttpError<Admin403ErrorData>(
        `Admin permissions required: [${reqPermissions.join(', ')}]`,
        {
          adminPermissionsRequired: reqPermissions,
          email,
          httpStatusCode: 403,
          userFriendly: true,
        },
      )
    }

    return {
      email,
      permissions: [...hasPermissions!],
    }
  }

  // convenience method
  async hasPermission(
    req: Request,
    reqPermission: string,
    meta?: Record<string, any>,
  ): Promise<boolean> {
    return !!(await this.hasPermissions(req, [reqPermission], meta))
  }

  async requirePermission(
    req: Request,
    reqPermission: string,
    meta?: Record<string, any>,
  ): Promise<AdminInfo> {
    return await this.requirePermissions(req, [reqPermission], meta)
  }
}
