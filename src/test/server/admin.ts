import { requireEnvKeys } from '@naturalcycles/nodejs-lib'
import { FirebaseSharedService } from '../..'
import { createAdminMiddleware } from '../../admin/admin.mw'
import { BaseAdminService } from '../../admin/base.admin.service'
require('dotenv').config()

const { FIREBASE_SERVICE_ACCOUNT_PATH, FIREBASE_API_KEY, FIREBASE_AUTH_DOMAIN } = requireEnvKeys(
  'FIREBASE_SERVICE_ACCOUNT_PATH',
  'FIREBASE_API_KEY',
  'FIREBASE_AUTH_DOMAIN',
)

export const firebaseService = new FirebaseSharedService({
  authDomain: FIREBASE_AUTH_DOMAIN,
  apiKey: FIREBASE_API_KEY,
  serviceAccount: FIREBASE_SERVICE_ACCOUNT_PATH,
})

class AdminService extends BaseAdminService {
  getEmailPermissions(_email?: string): Set<string> | undefined {
    return new Set() // allow all
    // return // deny all
  }
}

// const firebaseAdmin
export const adminService = new AdminService(firebaseService.auth(), {
  authEnabled: false,
})

export const reqAdmin = createAdminMiddleware(adminService)
