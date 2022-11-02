import { buildProdCommand } from '@naturalcycles/dev-lib'
import { _objectAssign } from '@naturalcycles/js-lib'
import { execCommand } from '@naturalcycles/nodejs-lib/dist/exec'
import { deployHealthCheck, DeployHealthCheckOptions } from './deployHealthCheck'
import { deployPrepare, DeployPrepareOptions } from './deployPrepare'

export interface DeployGaeOptions extends DeployPrepareOptions, DeployHealthCheckOptions {}

export async function deployGae(opt: DeployGaeOptions = {}): Promise<void> {
  const { logOnFailure, logOnSuccess } = opt

  // 1. build-prod

  // await execCommand(`yarn`, [`build-prod`])
  await buildProdCommand()

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

  // gcloud app deploy ./tmp/deploy/app.yaml --project $deployInfo_gaeProject --version $deployInfo_gaeVersion --quiet --no-promote
  await execCommand(
    `gcloud app deploy ${appYamlPath} --project ${gaeProject} --version ${gaeVersion} --quiet --no-promote`,
  ).catch(async err => {
    if (logOnFailure) {
      await logs(gaeProject, gaeService, gaeVersion)
    }

    throw err
  })

  // Health check (versionUrl)
  // yarn deploy-health-check --url $deployInfo_versionUrl --repeat 3 --timeoutSec 180 --intervalSec 2
  await deployHealthCheck(versionUrl, opt)

  // Only if "timestamped version" is used ('1' is default)
  if (gaeVersion !== '1') {
    // Rollout (promote versionUrl to serviceUrl)
    // gcloud app services set-traffic $deployInfo_gaeService --project $deployInfo_gaeProject --splits $deployInfo_gaeVersion=1 --quiet
    await execCommand(
      `gcloud app services set-traffic ${gaeService} --project ${gaeProject} --splits ${gaeVersion}=1 --quiet`,
    )

    // Health check (serviceUrl)
    // yarn deploy-health-check --url $deployInfo_serviceUrl --repeat 3 --timeoutSec 60 --intervalSec 2
    await deployHealthCheck(serviceUrl, opt)
  }

  // Logs
  if (logOnSuccess) {
    await logs(gaeProject, gaeService, gaeVersion)
  }
}

async function logs(gaeProject: string, gaeService: string, gaeVersion: string): Promise<void> {
  await execCommand(
    `gcloud app logs read --project ${gaeProject} --service ${gaeService} --version ${gaeVersion}`,
  ).catch(_ignored => {})
}
