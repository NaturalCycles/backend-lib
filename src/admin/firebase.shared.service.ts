import { memo } from '@naturalcycles/js-lib'
import { ServiceAccount } from 'firebase-admin'
import * as firebaseAdmin from 'firebase-admin'

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
  constructor (public cfg: FirebaseSharedServiceCfg) {}

  init (): void {
    this.admin()
  }

  @memo()
  admin (): firebaseAdmin.app.App {
    const { serviceAccount } = this.cfg

    const credential = serviceAccount
      ? firebaseAdmin.credential.cert(serviceAccount)
      : firebaseAdmin.credential.applicationDefault()

    return firebaseAdmin.initializeApp({
      credential,
    })
  }

  auth (): firebaseAdmin.auth.Auth {
    return this.admin().auth()
  }
}
