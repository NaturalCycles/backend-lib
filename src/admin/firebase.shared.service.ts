import { memo } from '@naturalcycles/js-lib'
import { ServiceAccount } from 'firebase-admin'
import * as firebaseAdmin from 'firebase-admin'

export interface FirebaseSharedServiceCfg {
  /**
   * If undefined - will try to use credential.applicationDefault()
   */
  serviceAccount?: ServiceAccount
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
}
