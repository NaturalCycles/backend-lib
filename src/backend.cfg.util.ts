import {
  anyObjectSchema,
  arraySchema,
  booleanSchema,
  objectSchema,
  stringSchema,
  validate,
} from '@naturalcycles/nodejs-lib'
import * as fs from 'fs-extra'

export interface BackendCfg {
  gaeProject: string

  gaeProjectByBranch?: Record<string, string>

  /**
   * @example default
   */
  gaeService: string

  gaeServiceByBranch?: Record<string, string>

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
  appEnvByBranch?: Record<string, string>

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

export async function getBackendCfg (projectDir: string = '.'): Promise<BackendCfg> {
  const backendCfgPath = `${projectDir}/backend.cfg.json`

  const backendCfg: BackendCfg = await fs.readJson(backendCfgPath).catch(_err => {
    throw new Error(`Failed to read ${backendCfgPath}`)
  })

  return validate(
    {
      serviceWithBranchName: true,
      ...backendCfg,
    },
    backendCfgSchema,
    'backend.cfg.json',
  )
}
