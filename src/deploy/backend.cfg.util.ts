import { StringMap } from '@naturalcycles/js-lib'
import {
  anyObjectSchema,
  arraySchema,
  booleanSchema,
  objectSchema,
  requireFileToExist,
  stringSchema,
  validate,
} from '@naturalcycles/nodejs-lib'
import * as fs from 'fs-extra'
import * as yaml from 'js-yaml'

export interface BackendCfg {
  gaeProject: string

  gaeProjectByBranch?: StringMap

  /**
   * @example default
   */
  gaeService: string

  gaeServiceByBranch?: StringMap

  /**
   * @default true
   *
   * If true - service name will look like ${branchName}--${gaeService}, similar to Netlify.
   * If false - ${gaeService}.
   *
   * Prod branch NEVER includes branchName in service name.
   */
  serviceWithBranchName?: boolean

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

  /**
   * Comma-separated list of env variables that will be passed to app.yaml from process.env
   */
  appYamlPassEnv?: string
}

const backendCfgSchema = objectSchema<BackendCfg>({
  gaeProject: stringSchema,
  gaeProjectByBranch: anyObjectSchema.optional(),
  gaeService: stringSchema,
  gaeServiceByBranch: anyObjectSchema.optional(),
  serviceWithBranchName: booleanSchema.optional(),
  prodBranch: stringSchema,
  files: arraySchema(stringSchema).optional(),
  appEnvDefault: stringSchema,
  appEnvByBranch: anyObjectSchema.optional(),
  branchesWithTimestampVersions: arraySchema(stringSchema).optional(),
  appYamlPassEnv: stringSchema.optional(),
})

export function getBackendCfg(projectDir: string = '.'): BackendCfg {
  const backendCfgYamlPath = `${projectDir}/backend.cfg.yaml`

  requireFileToExist(backendCfgYamlPath)

  const backendCfg = yaml.safeLoad(fs.readFileSync(backendCfgYamlPath, 'utf8')) as any

  return validate(
    {
      serviceWithBranchName: true,
      ...backendCfg,
    },
    backendCfgSchema,
    'backend.cfg.json',
  )
}
