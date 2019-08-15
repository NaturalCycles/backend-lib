import { requireEnvKeys } from '@naturalcycles/nodejs-lib'
import * as FirebaseAdmin from 'firebase-admin'
import { createAdminMiddleware } from '../../admin/admin.mw'
import { BaseAdminService } from '../../admin/base.admin.service'
require('dotenv').config()

const { FIREBASE_SERVICE_ACCOUNT_PATH, FIREBASE_API_KEY, FIREBASE_AUTH_DOMAIN } = requireEnvKeys(
  'FIREBASE_SERVICE_ACCOUNT_PATH',
  'FIREBASE_API_KEY',
  'FIREBASE_AUTH_DOMAIN',
)

const firebaseAdmin = FirebaseAdmin.initializeApp({
  credential: FirebaseAdmin.credential.cert(FIREBASE_SERVICE_ACCOUNT_PATH),
})

class AdminService extends BaseAdminService {
  getEmailPermissions (email?: string): Set<string> | undefined {
    return new Set() // allow all
    // return // deny all
  }
}

// const firebaseAdmin
export const adminService = new AdminService(firebaseAdmin.auth(), {
  firebaseAuthDomain: FIREBASE_AUTH_DOMAIN,
  firebaseApiKey: FIREBASE_API_KEY,
  authEnabled: true,
})

export const reqAdmin = createAdminMiddleware(adminService)
