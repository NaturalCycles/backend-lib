import { boldGrey, green, red, yellow } from '@naturalcycles/nodejs-lib/dist/colors'
import { Request } from 'express'

export function logRequest(req: Request, statusCode: number, ...tokens: any[]): void {
  req.log[logLevel(statusCode)](
    [coloredHttpCode(statusCode), req.method, boldGrey(req.url), ...tokens].join(' '),
  )
}

export function coloredHttpCode(statusCode: number): string {
  if (statusCode >= 200 && statusCode < 400) return green(statusCode)
  if (statusCode >= 400 && statusCode < 500) return yellow(statusCode)
  return red(statusCode)
}

function logLevel(statusCode?: number): 'info' | 'warn' | 'error' {
  if (!statusCode || statusCode < 400) return 'info'
  if (statusCode < 500) return 'warn'
  return 'error'
}
