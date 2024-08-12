import { _assert, StringMap } from '@naturalcycles/js-lib'
import { dimGrey } from '@naturalcycles/nodejs-lib'

export interface BaseEnv {
  name: string
}

export interface EnvSharedServiceCfg<ENV> {
  /**
   * Dir with ${envName}.env.ts files
   */
  envMap: StringMap<ENV>
}

export class EnvSharedService<ENV extends BaseEnv> {
  constructor(public cfg: EnvSharedServiceCfg<ENV>) {}

  private env?: ENV

  init(): void {
    this.getEnv()
  }

  getEnv(): ENV {
    if (!this.env) {
      const { APP_ENV } = process.env
      _assert(APP_ENV, 'APP_ENV should be defined!')

      const env = this.cfg.envMap[APP_ENV]
      _assert(env, `Environment ${APP_ENV} is not defined`)

      this.env = env
      console.log(`APP_ENV=${dimGrey(APP_ENV)} loaded`)
    }

    return this.env
  }

  setEnv(env?: ENV): void {
    this.env = env
    console.log(`setEnv APP_ENV=${dimGrey(env?.name || 'undefined')}`)
  }
}
