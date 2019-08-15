import { Debug, DebugLogLevel } from '@naturalcycles/nodejs-lib'
import * as c from 'ansi-colors'
import { Request } from 'express'

const log = Debug('nc:backend-lib')

export function logRequest (req: Request, statusCode: number, ...tokens: any[]): void {
  log[logLevel(statusCode)](
    [coloredCode(statusCode), req.method, c.bold(req.url), ...tokens].join(' '),
  )
}

function coloredCode (statusCode: number): string {
  if (statusCode < 400) return c.green(String(statusCode))
  if (statusCode < 500) return c.yellow(String(statusCode))
  return c.red(String(statusCode))
}

function logLevel (statusCode?: number): DebugLogLevel {
  if (!statusCode || statusCode < 400) return DebugLogLevel.info
  if (statusCode < 500) return DebugLogLevel.warn
  return DebugLogLevel.error
}
