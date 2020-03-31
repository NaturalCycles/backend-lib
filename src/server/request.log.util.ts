import { chalk, Debug, DebugLogLevel, green, red, yellow } from '@naturalcycles/nodejs-lib'
import { Request } from 'express'

const log = Debug('nc:backend-lib')

export function logRequest(req: Request, statusCode: number, ...tokens: any[]): void {
  log[logLevel(statusCode)](
    [coloredHttpCode(statusCode), req.method, chalk.bold(req.url), ...tokens].join(' '),
  )
}

export function coloredHttpCode(statusCode: number): string {
  if (statusCode >= 200 && statusCode < 400) return green(String(statusCode))
  if (statusCode >= 400 && statusCode < 500) return yellow(String(statusCode))
  return red(String(statusCode))
}

function logLevel(statusCode?: number): DebugLogLevel {
  if (!statusCode || statusCode < 400) return DebugLogLevel.info
  if (statusCode < 500) return DebugLogLevel.warn
  return DebugLogLevel.error
}
