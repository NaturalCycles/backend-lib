import { execShell } from '@naturalcycles/dev-lib'
import { buildProdCommand } from '@naturalcycles/dev-lib/dist/cmd/build-prod.command'
import * as yargs from 'yargs'
import { deployPrepareCommand } from './deploy.util'
import { deployHealthCheck } from './deployHealthCheck.command'

export async function deployGaeCommand (): Promise<void> {
  const { logs } = yargs.options({
    logs: {
      type: 'boolean',
      default: false,
    },
  }).argv

  // 1. build-prod

  // await execCommand(`yarn`, [`build-prod`])
  await buildProdCommand()

  // 2. deploy-prepare

  // await execCommand(`yarn`, ['deploy-prepare'])
  const deployInfo = await deployPrepareCommand()
  console.log({ deployInfo })

  const targetDir = './tmp/deploy'
  const appYamlPath = `${targetDir}/app.yaml`

  const { gaeProject, gaeService, gaeVersion, versionUrl, serviceUrl } = deployInfo

  // gcloud app deploy ./tmp/deploy/app.yaml --project $deployInfo_gaeProject --version $deployInfo_gaeVersion --quiet --no-promote
  await execShell(
    `gcloud app deploy ${appYamlPath} --project ${gaeProject} --version ${gaeVersion} --quiet --no-promote`,
  )

  // Health check (versionUrl)
  // yarn deploy-health-check --url $deployInfo_versionUrl --repeat 3 --timeoutSec 180 --intervalSec 2
  await deployHealthCheck({
    url: versionUrl,
    repeat: 3,
    timeoutSec: 180,
    intervalSec: 2,
  })

  // Rollout (promote versionUrl to serviceUrl)
  // gcloud app services set-traffic $deployInfo_gaeService --project $deployInfo_gaeProject --splits $deployInfo_gaeVersion=1 --quiet
  await execShell(
    `gcloud app services set-traffic ${gaeService} --project ${gaeProject} --splits ${gaeVersion}=1 --quiet`,
  )

  // Health check (serviceUrl)
  // yarn deploy-health-check --url $deployInfo_serviceUrl --repeat 3 --timeoutSec 60 --intervalSec 2
  await deployHealthCheck({
    url: serviceUrl,
    repeat: 3,
    timeoutSec: 60,
    intervalSec: 2,
  })

  // Logs
  if (logs) {
    // gcloud app logs read --project $deployInfo_gaeProject --service $deployInfo_gaeService --version $deployInfo_gaeVersion
    await execShell(
      `gcloud app logs read --project ${gaeProject} --service ${gaeService} --version ${gaeVersion}`,
    )
  }
}
