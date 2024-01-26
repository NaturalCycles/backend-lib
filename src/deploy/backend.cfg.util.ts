import { StringMap } from '@naturalcycles/js-lib'
import { AjvSchema, fs2, requireFileToExist } from '@naturalcycles/nodejs-lib'
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
    ...fs2.readYaml(backendCfgYamlPath),
  }

  backendCfgSchema.validate(backendCfg)
  return backendCfg
}
