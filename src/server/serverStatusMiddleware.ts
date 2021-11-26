import { _filterFalsyValues } from '@naturalcycles/js-lib'
import { memoryUsageFull, processSharedUtil } from '@naturalcycles/nodejs-lib'
import { dayjs } from '@naturalcycles/time-lib'
import { getDeployInfo } from './deployInfo.util'
import { BackendRequestHandler } from './server.model'

const { versions } = process
const { GAE_APPLICATION, GAE_SERVICE, GAE_VERSION, APP_ENV } = process.env

export function serverStatusMiddleware(projectDir?: string, extra?: any): BackendRequestHandler {
  return async (req, res) => {
    res.json(getServerStatusData(projectDir, extra))
  }
}

export function getServerStatusData(
  projectDir: string = process.cwd(),
  extra?: any,
): Record<string, any> {
  const { gitRev, gitBranch, prod, ts } = getDeployInfo(projectDir)
  const deployBuildTimeUTC = dayjs.unix(ts).toPretty()
  const buildInfo = [dayjs.unix(ts).toCompactTime(), gitBranch, gitRev].filter(Boolean).join('_')

  return _filterFalsyValues({
    started: getStartedStr(),
    deployBuildTimeUTC,
    APP_ENV,
    prod,
    buildInfo,
    GAE_APPLICATION,
    GAE_SERVICE,
    GAE_VERSION,
    mem: memoryUsageFull(),
    cpuAvg: processSharedUtil.cpuAvg(),
    // resourceUsage: process.resourceUsage?.(),
    versions,
    ...extra,
  })
}

function getStartedStr(): string {
  const serverStarted = dayjs.utc().subtract(process.uptime(), 's')

  const s1 = dayjs(serverStarted).toPretty()
  const s2 = dayjs(serverStarted).fromNow()
  return `${s1} UTC (${s2})`
}
