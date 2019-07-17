import { filterFalsyValues } from '@naturalcycles/js-lib'
import { processSharedUtil } from '@naturalcycles/nodejs-lib'
import { dayjs } from '@naturalcycles/time-lib'
import { RequestHandler } from 'express'

interface ServerStartedContainer {
  /**
   * Unix timestamp in millis
   */
  serverStarted?: number
}

export function createRootHandler (
  serverStartedContainer: ServerStartedContainer,
  extra?: any,
): RequestHandler {
  const { APP_ENV } = process.env

  return async (req, res) => {
    res.json(
      filterFalsyValues({
        started: getStartedStr(serverStartedContainer.serverStarted),
        APP_ENV,
        mem: processSharedUtil.memoryUsage(),
        cpuAvg: processSharedUtil.cpuAvg(),
        GAE_APPLICATION: process.env.GAE_APPLICATION,
        GAE_SERVICE: process.env.GAE_SERVICE,
        GAE_VERSION: process.env.GAE_VERSION,
        ...extra,
      }),
    )
  }
}

function getStartedStr (serverStarted?: number): string {
  if (!serverStarted) return 'not started yet'

  const s1 = dayjs(serverStarted).toPretty()
  const s2 = dayjs(serverStarted).fromNow()
  return `${s1} UTC (${s2})`
}
