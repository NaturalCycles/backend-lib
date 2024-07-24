import { _anyToError, _objectAssign, pRetry } from '@naturalcycles/js-lib'
import { appendToGithubSummary, execVoidCommandSync } from '@naturalcycles/nodejs-lib'
import { getBackendCfg } from './backend.cfg.util'
import { createDeployInfo } from './deploy.util'
import { deployHealthCheck, DeployHealthCheckOptions } from './deployHealthCheck'
import { deployPrepare, DeployPrepareOptions } from './deployPrepare'

export interface DeployGaeOptions extends DeployPrepareOptions, DeployHealthCheckOptions {}

export async function deployGae(opt: DeployGaeOptions = {}): Promise<void> {
  const { logOnFailure, logOnSuccess } = opt

  // 1. build

  execVoidCommandSync('yarn', ['build'])

  // 2. deploy-prepare

  const deployInfo = await deployPrepare()

  const targetDir = './tmp/deploy'
  const appYamlPath = `${targetDir}/app.yaml`

  const { gaeProject, gaeService, gaeVersion, versionUrl, serviceUrl } = deployInfo
  _objectAssign(opt, {
    gaeProject,
    gaeService,
    gaeVersion,
  })

  await pRetry(
    async () => {
      try {
        execVoidCommandSync(
          `gcloud app deploy ${appYamlPath} --project ${gaeProject} --version ${gaeVersion} --quiet --no-promote`,
          [],
          { shell: true },
        )
      } catch (err) {
        if (logOnFailure) {
          logs(gaeProject, gaeService, gaeVersion)
        }
        throw err
      }
    },
    {
      name: 'deploy',
      maxAttempts: 2,
      delay: 30_000,
      // todo: this doesn't work, as the error is different from what is logged.
      // We shoud somehow capture the logged text
      predicate: err => _anyToError(err).message.includes('operation is already in progress'),
    },
  )

  // Health check (versionUrl)
  // yarn deploy-health-check --url $deployInfo_versionUrl --repeat 3 --timeoutSec 180 --intervalSec 2
  await deployHealthCheck(versionUrl, opt)

  // Only if "timestamped version" is used ('1' is default)
  if (gaeVersion !== '1') {
    // Rollout (promote versionUrl to serviceUrl)
    // gcloud app services set-traffic $deployInfo_gaeService --project $deployInfo_gaeProject --splits $deployInfo_gaeVersion=1 --quiet
    execVoidCommandSync(
      `gcloud app services set-traffic ${gaeService} --project ${gaeProject} --splits ${gaeVersion}=1 --quiet`,
      [],
      { shell: true },
    )

    // Health check (serviceUrl)
    // yarn deploy-health-check --url $deployInfo_serviceUrl --repeat 3 --timeoutSec 60 --intervalSec 2
    await deployHealthCheck(serviceUrl, opt)
  }

  appendToGithubSummary(`Deployed ${serviceUrl}`)

  // Logs
  if (logOnSuccess) {
    logs(gaeProject, gaeService, gaeVersion)
  }
}

/**
 * Undeploys/removes the GAE service/version, using the same rules as deployGae.
 * Detects the service/version by the same criteria: branch name, backend.cfg.yaml, etc.
 */
export async function undeployGae(branch: string): Promise<void> {
  const projectDir = '.'
  const backendCfg = getBackendCfg(projectDir)

  const { gaeProject, gaeService, gaeVersion } = await createDeployInfo(backendCfg, branch)

  // if (prod) {
  //   console.log(`undeployGae (branch: ${branch}): not removing prod version (safety check)`)
  //   return
  // }

  console.log(
    `undeployGae (branch: ${branch}): going to remove ${gaeProject}/${gaeService}/${gaeVersion}`,
  )

  execVoidCommandSync(
    `gcloud app versions delete --project ${gaeProject} --service ${gaeService} ${gaeVersion} --quiet`,
    [],
    { shell: true },
  )

  appendToGithubSummary(`removed ${gaeProject}/${gaeService}/${gaeVersion}`)
}

function logs(gaeProject: string, gaeService: string, gaeVersion: string): void {
  try {
    execVoidCommandSync(
      `gcloud app logs read --project ${gaeProject} --service ${gaeService} --version ${gaeVersion}`,
      [],
      { shell: true },
    )
  } catch {}
}
