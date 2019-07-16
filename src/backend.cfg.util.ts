import { StringMap } from '@naturalcycles/js-lib'
import {
  anyObjectSchema,
  arraySchema,
  objectSchema,
  stringSchema,
  validate,
} from '@naturalcycles/nodejs-lib'
import * as fs from 'fs-extra'

export interface BackendCfg {
  gaeProject: string

  gaeProjectByBranch?: StringMap

  /**
   * @example default
   */
  gaeService: string

  /**
   * @example prod
   */
  prodBranch: string

  /**
   * List of file patterns to include in deployment.
   */
  files?: string[]

  appEnvDefault: string
  appEnvByBranch?: StringMap

  /**
   * List of branches to use timestamps in gae version names (to keep previous versions).
   */
  branchesWithTimestampVersions?: string[]
}

const backendCfgSchema = objectSchema<BackendCfg>({
  gaeProject: stringSchema,
  gaeProjectByBranch: anyObjectSchema.optional(),
  gaeService: stringSchema,
  prodBranch: stringSchema,
  files: arraySchema(stringSchema).optional(),
  appEnvDefault: stringSchema,
  appEnvByBranch: anyObjectSchema.optional(),
})

export async function getBackendCfg (projectDir: string = '.'): Promise<BackendCfg> {
  const backendCfgPath = `${projectDir}/backend.cfg.json`

  const backendCfg: BackendCfg = await fs.readJson(backendCfgPath).catch(_err => {
    throw new Error(`Failed to read ${backendCfgPath}`)
  })

  return validate(backendCfg, backendCfgSchema, 'backend.cfg.json')
}
