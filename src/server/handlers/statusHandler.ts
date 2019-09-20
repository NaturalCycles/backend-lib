import { filterFalsyValues } from '@naturalcycles/js-lib'
import { memoryUsageFull, processSharedUtil } from '@naturalcycles/nodejs-lib'
import { dayjs } from '@naturalcycles/time-lib'
import { RequestHandler } from 'express'
import { getDeployInfo } from '../deployInfo.util'

/**
 * @returns unix timestamp in millis
 */
type ServerStartedCallback = () => number | undefined

const now = Date.now()
const defaultServerStartedCallback = () => now

export function statusHandler(
  serverStartedCallback?: ServerStartedCallback,
  projectDir?: string,
  extra?: any,
): RequestHandler {
  return async (req, res) => {
    res.json(statusHandlerData(serverStartedCallback, projectDir, extra))
  }
}

export function statusHandlerData(
  serverStartedCallback: ServerStartedCallback = defaultServerStartedCallback,
  projectDir: string = process.cwd(),
  extra?: any,
): Record<string, any> {
  const { APP_ENV } = process.env
  const { gitRev, gitBranch, prod, ts } = getDeployInfo(projectDir)
  const deployBuildTimeUTC = dayjs.unix(ts).toPretty()
  const buildInfo = [dayjs.unix(ts).toCompactTime(), gitBranch, gitRev].filter(Boolean).join('_')

  return filterFalsyValues({
    started: getStartedStr(serverStartedCallback()),
    deployBuildTimeUTC,
    APP_ENV,
    prod,
    buildInfo,
    mem: memoryUsageFull(),
    cpuAvg: processSharedUtil.cpuAvg(),
    GAE_APPLICATION: process.env.GAE_APPLICATION,
    GAE_SERVICE: process.env.GAE_SERVICE,
    GAE_VERSION: process.env.GAE_VERSION,
    ...extra,
  })
}

function getStartedStr(serverStarted?: number): string {
  if (!serverStarted) return 'not started yet'

  const s1 = dayjs(serverStarted).toPretty()
  const s2 = dayjs(serverStarted).fromNow()
  return `${s1} UTC (${s2})`
}
