import { _Memo } from '@naturalcycles/js-lib'
import type { ServiceAccount } from 'firebase-admin'
import type * as FirebaseAdmin from 'firebase-admin'

export interface FirebaseSharedServiceCfg {
  /**
   * If undefined - will try to use credential.applicationDefault()
   * Can be ServiceAccount object or path to a json file (string)
   */
  serviceAccount?: ServiceAccount | string

  /**
   * Used in Firebase Auth.
   */
  authDomain: string

  /**
   * Used e.g in Firebase Auth to decrypt JWT auth tokens.
   */
  apiKey: string

  /**
   * @default 'GoogleAuthProvider'
   */
  adminAuthProvider?: string
}

export class FirebaseSharedService {
  constructor(public cfg: FirebaseSharedServiceCfg) {}

  init(): void {
    this.admin()
  }

  @_Memo()
  admin(): FirebaseAdmin.app.App {
    const { serviceAccount } = this.cfg

    // lazy loading
    const admin = require('firebase-admin') as typeof FirebaseAdmin

    const credential = serviceAccount
      ? admin.credential.cert(serviceAccount)
      : admin.credential.applicationDefault()

    return admin.initializeApp({
      credential,
    })
  }

  auth(): FirebaseAdmin.auth.Auth {
    return this.admin().auth()
  }
}
