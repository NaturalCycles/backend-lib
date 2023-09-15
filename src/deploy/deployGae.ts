import { buildProdCommand } from '@naturalcycles/dev-lib'
import { _anyToError, _objectAssign, pRetry } from '@naturalcycles/js-lib'
import { execVoidCommandSync } from '@naturalcycles/nodejs-lib'
import { deployHealthCheck, DeployHealthCheckOptions } from './deployHealthCheck'
import { deployPrepare, DeployPrepareOptions } from './deployPrepare'

export interface DeployGaeOptions extends DeployPrepareOptions, DeployHealthCheckOptions {}

export async function deployGae(opt: DeployGaeOptions = {}): Promise<void> {
  const { logOnFailure, logOnSuccess } = opt

  // 1. build-prod

  // await execCommand(`yarn`, [`build-prod`])
  buildProdCommand()

  // 2. deploy-prepare

  // await execCommand(`yarn`, ['deploy-prepare'])
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

  // Logs
  if (logOnSuccess) {
    logs(gaeProject, gaeService, gaeVersion)
  }
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
