import { inspect, InspectOptions } from 'util'
import { pDelay, _filterFalsyValues, _ms, _since } from '@naturalcycles/js-lib'
import { getGot } from '@naturalcycles/nodejs-lib'
import { dimGrey, red } from '@naturalcycles/nodejs-lib/dist/colors'
import { execCommand } from '@naturalcycles/nodejs-lib/dist/exec'
import { coloredHttpCode } from '../server/request.log.util'

export interface DeployHealthCheckOptions {
  thresholdHealthy?: number
  thresholdUnhealthy?: number
  maxTries?: number
  timeoutSec?: number
  intervalSec?: number
  logOnFailure?: boolean
  logOnSuccess?: boolean
  gaeProject?: string
  gaeService?: string
  gaeVersion?: string
}

export const deployHealthCheckYargsOptions = {
  thresholdHealthy: {
    type: 'number',
    default: 5,
  },
  thresholdUnhealthy: {
    type: 'number',
    default: 1,
  },
  maxTries: {
    type: 'number',
    default: 20,
  },
  timeoutSec: {
    type: 'number',
    default: 180,
  },
  intervalSec: {
    type: 'number',
    default: 1,
  },
  logOnFailure: {
    type: 'boolean',
    default: true,
    desc: 'Show server logs on health check failure (requires gaeProject, gaeService, gaeVersion)',
  },
  logOnSuccess: {
    type: 'boolean',
    default: false,
    desc: 'Show server logs on health check success (requires gaeProject, gaeService, gaeVersion)',
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
} as const

const inspectOpt: InspectOptions = {
  colors: true,
  breakLength: 120,
}

/**
 * Requires up to `healthyThreshold` consecutive OK responses to succeed.
 * Fails on up to `unhealthyThreshold` consecutive FAIL responses.
 * Fails after maxTries.
 */
export async function deployHealthCheck(
  url: string,
  opt: DeployHealthCheckOptions = {},
): Promise<void> {
  const {
    thresholdHealthy = 5,
    thresholdUnhealthy = 1,
    maxTries = 20,
    timeoutSec = 30,
    intervalSec = 1,
    logOnFailure = true,
    logOnSuccess,
    gaeProject,
    gaeService,
    gaeVersion,
  } = opt

  let attempt = 0
  let countHealthy = 0
  let countUnhealthy = 0
  let done = false
  let doneReason: string | undefined
  let failed = false
  let currentInterval = intervalSec * 1000

  const got = getGot()

  while (!done) {
    // eslint-disable-next-line no-await-in-loop
    await makeAttempt()
  }

  if (failed) {
    console.log(red(`Health check failed!`))

    if (logOnFailure) {
      await execCommand(
        `gcloud app logs read --project ${gaeProject} --service ${gaeService} --version ${gaeVersion}`,
      ).catch(_ignored => {})
    }

    process.exit(1)
  }

  if (logOnSuccess) {
    await execCommand(
      `gcloud app logs read --project ${gaeProject} --service ${gaeService} --version ${gaeVersion}`,
    ).catch(_ignored => {})
  }

  async function makeAttempt(): Promise<void> {
    attempt++

    console.log([`>>`, dimGrey(url), inspect({ attempt }, inspectOpt)].join(' '))

    const started = Date.now()

    const { statusCode } = await got(url, {
      responseType: 'json',
      timeout: timeoutSec * 1000,
      retry: 0, // no retries allowed
      followRedirect: false,
      throwHttpErrors: false,
    }).catch((err: Error) => {
      console.log(err.message)

      return {
        statusCode: 0,
      }
    })

    if (statusCode === 200) {
      countHealthy++
      countUnhealthy = 0
      currentInterval = intervalSec * 1000 // reset
    } else {
      countUnhealthy++
      countHealthy = 0
      currentInterval = Math.round(currentInterval * 1.5) // exponential back-off
    }

    if (countHealthy >= thresholdHealthy) {
      doneReason = `reached thresholdHealthy of ${thresholdHealthy}`
      done = true
    } else if (countUnhealthy >= thresholdUnhealthy) {
      doneReason = `reached thresholdUnhealthy of ${thresholdUnhealthy}`
      done = true
      failed = true
    }

    console.log(
      [
        `<< HTTP`,
        coloredHttpCode(statusCode),
        dimGrey(_since(started)),
        inspect(_filterFalsyValues({ countHealthy, countUnhealthy }), inspectOpt),
      ].join(' '),
    )

    if (attempt >= maxTries) {
      doneReason = `reached maxTries of ${maxTries}`
      done = true
      failed = true
    }

    if (done) {
      console.log(doneReason)
    } else {
      console.log(dimGrey(`... waiting ${_ms(currentInterval)} ...`))
      await pDelay(currentInterval)
    }
  }
}
