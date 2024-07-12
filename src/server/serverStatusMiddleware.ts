import { _filterNullishValues, localTime } from '@naturalcycles/js-lib'
import { memoryUsageFull, processSharedUtil } from '@naturalcycles/nodejs-lib'
import { getDeployInfo } from './deployInfo.util'
import { BackendRequestHandler } from './server.model'

const { versions } = process
const { GAE_APPLICATION, GAE_SERVICE, GAE_VERSION, APP_ENV, NODE_OPTIONS } = process.env

export function serverStatusMiddleware(projectDir?: string, extra?: any): BackendRequestHandler {
  return async (req, res) => {
    res.json(getServerStatusData(projectDir, extra))
  }
}

export function getServerStatusData(
  projectDir: string = process.cwd(),
  extra?: any,
): Record<string, any> {
  const { gitRev, gitBranch, ts } = getDeployInfo(projectDir)
  const t = localTime(ts)
  const deployBuildTime = t.toPretty()
  const buildInfo = [t.toStringCompact(), gitBranch, gitRev].filter(Boolean).join('_')

  return _filterNullishValues({
    started: getStartedStr(),
    deployBuildTime,
    APP_ENV,
    buildInfo,
    GAE_APPLICATION,
    GAE_SERVICE,
    GAE_VERSION,
    mem: memoryUsageFull(),
    cpuAvg: processSharedUtil.cpuAvg(),
    // resourceUsage: process.resourceUsage?.(),
    versions,
    NODE_OPTIONS,
    fetch: typeof globalThis.fetch === 'function',
    ...extra,
  })
}

function getStartedStr(): string {
  const started = localTime.now().minus(process.uptime(), 'second')
  return `${started.toPretty()} (${started.toFromNowString()})`
}
