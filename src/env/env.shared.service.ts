import { dimGrey } from '@naturalcycles/nodejs-lib/dist/colors'
import { log } from '../log'
import { BaseEnv } from './env.model'

export interface EnvSharedServiceCfg {
  /**
   * Dir with ${envName}.env.ts files
   */
  envDir: string
}

export class EnvSharedService<ENV extends BaseEnv = any> {
  constructor(private cfg: EnvSharedServiceCfg) {}

  private env?: ENV

  init(): void {
    this.getEnv()
  }

  getEnv(): ENV {
    if (!this.env) {
      const { APP_ENV } = process.env
      if (!APP_ENV) {
        throw new Error('APP_ENV should be defined!')
      }

      const { envDir } = this.cfg
      const envFilePath = `${envDir}/${APP_ENV}.env`

      try {
        const module = require(envFilePath)
        this.env = module.default
      } catch {
        throw new Error(`Cannot read envFile ${envFilePath}`)
      }

      log(`APP_ENV=${dimGrey(APP_ENV)} loaded`)
    }

    return this.env!
  }

  setEnv(env?: ENV): void {
    log(`setEnv APP_ENV=${dimGrey(env ? env.name : 'undefined')}`)
    this.env = env
  }
}
