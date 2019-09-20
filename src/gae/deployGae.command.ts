import { execShell } from '@naturalcycles/dev-lib'
import { buildProdCommand } from '@naturalcycles/dev-lib/dist/cmd/build-prod.command'
import { Debug } from '@naturalcycles/nodejs-lib'
import * as yargs from 'yargs'
import { deployPrepareCommand } from './deploy.util'
import { deployHealthCheck } from './deployHealthCheck.command'

// const log = Debug('nc:backend-lib:deploy')
Debug.enable('nc:backend-lib*') // force-enable

export async function deployGaeCommand(): Promise<void> {
  const { logOnFailure, logOnSuccess } = yargs.options({
    logOnFailure: {
      type: 'boolean',
      default: true,
      descr: 'Show server logs on failure',
    },
    logOnSuccess: {
      type: 'boolean',
      default: false,
      descr: 'Show server logs on success',
    },
  }).argv

  // 1. build-prod

  // await execCommand(`yarn`, [`build-prod`])
  await buildProdCommand()

  // 2. deploy-prepare

  // await execCommand(`yarn`, ['deploy-prepare'])
  const deployInfo = await deployPrepareCommand()

  const targetDir = './tmp/deploy'
  const appYamlPath = `${targetDir}/app.yaml`

  const { gaeProject, gaeService, gaeVersion, versionUrl, serviceUrl } = deployInfo

  // gcloud app deploy ./tmp/deploy/app.yaml --project $deployInfo_gaeProject --version $deployInfo_gaeVersion --quiet --no-promote
  await execShell(
    `gcloud app deploy ${appYamlPath} --project ${gaeProject} --version ${gaeVersion} --quiet --no-promote`,
  ).catch(async err => {
    if (logOnFailure) {
      await logs(gaeProject, gaeService, gaeVersion)
    }

    throw err
  })

  // Health check (versionUrl)
  // yarn deploy-health-check --url $deployInfo_versionUrl --repeat 3 --timeoutSec 180 --intervalSec 2
  await deployHealthCheck({
    url: versionUrl,
    repeat: 3,
    timeoutSec: 180,
    intervalSec: 2,
    logOnFailure,
    gaeProject,
    gaeService,
    gaeVersion,
  })

  // Only if "timestamped version" is used ('1' is default)
  if (gaeVersion !== '1') {
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
      logOnFailure,
      gaeProject,
      gaeService,
      gaeVersion,
    })
  }

  // Logs
  if (logOnSuccess) {
    await logs(gaeProject, gaeService, gaeVersion)
  }
}

async function logs(gaeProject: string, gaeService: string, gaeVersion: string): Promise<void> {
  await execShell(
    `gcloud app logs read --project ${gaeProject} --service ${gaeService} --version ${gaeVersion}`,
  ).catch(_ignored => {})
}
