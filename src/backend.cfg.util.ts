import { StringMap } from '@naturalcycles/js-lib'

export interface BackendCfg {
  gaeProject: string

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

export function getBackendCfg (projectDir: string): BackendCfg {
  const backendCfgPath = `${projectDir}/backend.cfg.json`

  try {
    return require(backendCfgPath)
  } catch (err) {
    throw new Error(`Failed to read ${backendCfgPath}`)
  }
}
