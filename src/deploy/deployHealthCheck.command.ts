import { pDelay, _range } from '@naturalcycles/js-lib'
import { Debug, dimGrey, execCommand } from '@naturalcycles/nodejs-lib'
import { since } from '@naturalcycles/time-lib'
import got from 'got'
import * as yargs from 'yargs'
import { coloredHttpCode } from '../server/request.log.util'

export interface DeployHealthCheckOptions {
  url: string
  repeat?: number
  timeoutSec?: number
  intervalSec?: number
  logOnFailure?: boolean
  logOnSuccess?: boolean
  gaeProject?: string
  gaeService?: string
  gaeVersion?: string
}

const log = Debug('nc:backend-lib:health')

export async function deployHealthCheckCommand(): Promise<void> {
  if (!Debug.enabled('nc:backend-lib')) {
    Debug.enable('nc:backend-lib*') // force-enable
  }

  const opt = yargs.options({
    url: {
      type: 'string',
      demandOption: true,
    },
    repeat: {
      type: 'number',
      default: 3,
    },
    timeoutSec: {
      type: 'number',
      default: 30,
    },
    intervalSec: {
      type: 'number',
      default: 2,
    },
    logOnFailure: {
      type: 'boolean',
      default: true,
      descr:
        'Show server logs on health check failure (requires gaeProject, gaeService, gaeVersion)',
    },
    logOnSuccess: {
      type: 'boolean',
      default: false,
      descr:
        'Show server logs on health check success (requires gaeProject, gaeService, gaeVersion)',
    },
    gaeProject: {
      type: 'string',
    },
    gaeService: {
      type: 'string',
    },
    gaeVersion: {
      type: 'string',
    },
  }).argv

  await deployHealthCheck(opt)
}

export async function deployHealthCheck(opt: DeployHealthCheckOptions): Promise<void> {
  const {
    url,
    repeat = 3,
    timeoutSec = 30,
    intervalSec = 2,
    logOnFailure = true,
    logOnSuccess,
    gaeProject,
    gaeService,
    gaeVersion,
  } = opt

  for await (const attempt of _range(1, repeat + 1)) {
    log(`>> ${dimGrey(url)} (attempt ${attempt} / ${repeat})`)
    const started = Date.now()

    const { statusCode } = await got(url, {
      responseType: 'json',
      timeout: timeoutSec * 1000,
      retry: 0, // no retries allowed
      followRedirect: false,
      throwHttpErrors: false,
    })

    log(`<< HTTP ${coloredHttpCode(statusCode)} ${dimGrey(since(started))}`)

    if (statusCode !== 200) {
      log.warn(`Health check failed!`)

      if (logOnFailure) {
        // gcloud app logs read --project $deployInfo_gaeProject --service $deployInfo_gaeService --version $deployInfo_gaeVersion
        await execCommand(
          `gcloud app logs read --project ${gaeProject} --service ${gaeService} --version ${gaeVersion}`,
        ).catch(_ignored => {})
      }

      process.exit(1)
    }

    await pDelay(intervalSec * 1000)
  }

  if (logOnSuccess) {
    await execCommand(
      `gcloud app logs read --project ${gaeProject} --service ${gaeService} --version ${gaeVersion}`,
    ).catch(_ignored => {})
  }
}
