import { _Memo } from '@naturalcycles/js-lib'
import type { AppOptions, ServiceAccount } from 'firebase-admin'
import type FirebaseAdmin from 'firebase-admin'

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

  /**
   * Will be passed to .initializeApp()
   */
  opt?: AppOptions

  /**
   * Second argument to .initializeApp()
   * When you need more-than-one firebase instance
   */
  appName?: string
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

    return admin.initializeApp(
      {
        credential,
        ...this.cfg.opt,
      },
      this.cfg.appName,
    )
  }

  auth(): FirebaseAdmin.auth.Auth {
    return this.admin().auth()
  }
}
