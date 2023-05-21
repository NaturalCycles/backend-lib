import { StringMap } from '@naturalcycles/js-lib'
import { _readFileSync, AjvSchema, requireFileToExist } from '@naturalcycles/nodejs-lib'
import * as yaml from 'js-yaml'
import { resourcesDir } from '../paths.cnst'

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

const backendCfgSchema = AjvSchema.readJsonSync<BackendCfg>(
  `${resourcesDir}/backendCfg.schema.json`,
  {
    objectName: 'backend.cfg.yaml',
  },
)

export function getBackendCfg(projectDir: string = '.'): BackendCfg {
  const backendCfgYamlPath = `${projectDir}/backend.cfg.yaml`

  requireFileToExist(backendCfgYamlPath)

  const backendCfg: BackendCfg = {
    serviceWithBranchName: true,
    ...(yaml.load(_readFileSync(backendCfgYamlPath)) as any),
  }

  backendCfgSchema.validate(backendCfg)
  return backendCfg
}
