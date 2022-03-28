import { _filterFalsyValues, localTime } from '@naturalcycles/js-lib'
import { memoryUsageFull, processSharedUtil } from '@naturalcycles/nodejs-lib'
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
  const t = localTime(ts).utc()
  const deployBuildTimeUTC = t.toPretty()
  const buildInfo = [t.toStringCompact(), gitBranch, gitRev].filter(Boolean).join('_')

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
  const started = localTime().utc().subtract(process.uptime(), 'second')
  return `${started.toPretty()} UTC (${started.fromNow()})`
}
