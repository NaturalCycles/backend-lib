import { filterFalsyValues } from '@naturalcycles/js-lib'
import { processSharedUtil } from '@naturalcycles/nodejs-lib'
import { dayjs } from '@naturalcycles/time-lib'
import { RequestHandler } from 'express'

/**
 * @returns unix timestamp in millis
 */
type ServerStartedCallback = () => number | undefined

export function createRootHandler (
  serverStartedCallback: ServerStartedCallback,
  extra?: any,
): RequestHandler {
  const { APP_ENV } = process.env

  return async (req, res) => {
    res.json(
      filterFalsyValues({
        started: getStartedStr(serverStartedCallback()),
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
