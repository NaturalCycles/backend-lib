import { Admin401ErrorData, Admin403ErrorData, HttpError } from '@naturalcycles/js-lib'
import { Debug } from '@naturalcycles/nodejs-lib'
import { Request } from 'express'
import * as FirebaseAdmin from 'firebase-admin'

const log = Debug('nc:backend-lib:admin')

export interface AdminServiceCfg {
  firebaseApiKey: string
  firebaseAuthDomain: string

  /**
   * @default 'GoogleAuthProvider'
   */
  firebaseAuthProvider?: string

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
  constructor (private firebaseAuth: FirebaseAdmin.auth.Auth, cfg: AdminServiceCfg) {
    this.cfg = {
      adminTokenKey: 'admin_token',
      authEnabled: true,
      firebaseAuthProvider: 'GoogleAuthProvider',
      ...cfg,
    }
  }

  cfg!: Required<AdminServiceCfg>

  /**
   * To be extended.
   *
   * Returns undefined if it's not an Admin.
   * Otherwise returns Set of permissions.
   * Empty array means it IS and Admin, but has no permissions (except being an Admin).
   */
  getEmailPermissions (email?: string): Set<string> | undefined {
    if (!email) return
    log(`getEmailPermissions (${email}) returning undefined (please override the implementation)`)
    return
  }

  /**
   * To be extended.
   */
  protected async onPermissionCheck (
    req: Request,
    email: string,
    reqPermissions: string[],
    required: boolean,
    granted: boolean,
  ): Promise<void> {
    log(
      `${email} ${required ? 'required' : 'optional'} permissions check [${reqPermissions.join(
        ', ',
      )}]: ${granted ? 'GRANTED' : 'DENIED'}`,
    )
  }

  async getEmailByToken (adminToken?: string): Promise<string | undefined> {
    if (!adminToken) return

    try {
      const decodedToken = await this.firebaseAuth.verifyIdToken(adminToken)
      const email = decodedToken && decodedToken.email
      log(`admin email: ${email}`)
      return email
    } catch (err) {
      log(`getEmailByToken error: ${(err || {}).message}`, err, JSON.stringify(err))
      return
    }
  }

  async getAdminToken (req: Request): Promise<string | undefined> {
    return req.cookies[this.cfg.adminTokenKey]
  }

  async isAdmin (req: Request): Promise<boolean> {
    return !!(await this.hasPermissions(req))
  }

  async getAdminInfo (req: Request): Promise<AdminInfo | undefined> {
    return this.hasPermissions(req)
  }

  // alias
  // async reqAdmin (req: Request): Promise<void> {
  //   await this.reqPermissions(req)
  // }

  /**
   * Returns AdminInfo if it has all required permissions.
   * Otherwise returns undefined
   */
  async hasPermissions (
    req: Request,
    reqPermissions: string[] = [],
  ): Promise<AdminInfo | undefined> {
    if (!this.cfg.authEnabled) return adminInfoDisabled()

    const adminToken = await this.getAdminToken(req)
    const email = await this.getEmailByToken(adminToken)
    const hasPermissions = this.getEmailPermissions(email)
    if (!hasPermissions) return

    const granted = reqPermissions.every(p => hasPermissions.has(p))

    void this.onPermissionCheck(req, email!, reqPermissions, false, granted)

    if (!granted) return

    return {
      email: email!,
      permissions: [...hasPermissions],
    }
  }

  async reqPermissions (req: Request, reqPermissions: string[] = []): Promise<AdminInfo> {
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
    const granted = !!hasPermissions && reqPermissions.every(p => hasPermissions.has(p))

    void this.onPermissionCheck(req, email, reqPermissions, true, granted)

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
}