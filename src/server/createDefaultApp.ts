import { StringMap } from '@naturalcycles/js-lib'
import * as cookieParser from 'cookie-parser'
import * as cors from 'cors'
import { Application, RequestHandler } from 'express'
import * as express from 'express'
import * as helmet from 'helmet'
import { SentrySharedService } from '..'
import { DefaultAppCfg } from './createDefaultApp.model'
import { genericErrorHandler } from './handlers/generic.error.handler'
import { notFoundHandler } from './handlers/notFound.handler'
import { sentryErrorMiddleware } from './handlers/sentry.error.mw'

export function createDefaultApp (
  defaultAppCfg: DefaultAppCfg,
  sentryService?: SentrySharedService,
): Application {
  const app = express()

  /*
  if (envService.isProd()) {
    // require('@google-cloud/trace-agent').start()
    // require('@google-cloud/debug-agent').start()
  }
  */

  app.disable('etag')
  app.set('trust proxy', true)

  // preHandlers
  useHandlers(app, defaultAppCfg.preHandlers)

  // The request handler must be the first middleware on the app
  if (sentryService) {
    app.use(sentryService.getRequestHandler())
  }

  app.use(express.json({ limit: '1mb' }))
  app.use(express.urlencoded({ limit: '1mb', extended: true }))
  app.use(cookieParser())
  app.use(helmet())
  app.use(
    cors({
      origin: true,
      credentials: true,
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      maxAge: 86400,
    }),
  )
  app.options('*', cors()) // enable pre-flight for all requests

  // GET /swagger-stats/stats
  // GET /swagger-stats/ui
  if (defaultAppCfg.swaggerStatsEnabled) {
    const swaggerStats = require('swagger-stats')

    const uriPath = '/swagger-stats'
    // app.use(adminMiddleware(uriPath)) // todo
    app.use(swaggerStats.getMiddleware({ uriPath }))
  }

  app.use(express.static('static'))

  // Handlers
  useHandlers(app, defaultAppCfg.handlers)

  // Resources
  useResources(app, defaultAppCfg.resources)

  // postHandlers
  useHandlers(app, defaultAppCfg.postHandlers)

  // Generic 404 handler
  app.use(notFoundHandler)

  // The error handler must be before any other error middleware
  // NO: Generic error handler chooses which errors to report to sentry
  // OR: another handler that will selectively report to Sentry and pass error further via next(err)
  // app.use(sentryService.getErrorHandler())
  if (sentryService) {
    app.use(
      sentryErrorMiddleware({
        sentryService,
      }),
    )
  }

  // Generic error handler
  // It handles errors, returns proper status, does sentry.captureException()
  // It only rethrows error that happen in errorHandlerMiddleware itself ("error in errorHandler"),
  // otherwise there is no more error propagation behind it
  app.use(genericErrorHandler)

  return app
}

function useHandlers (app: Application, handlers: RequestHandler[] = []): void {
  handlers.forEach(handler => {
    app.use(handler)
  })
}

function useResources (app: Application, resources: StringMap<RequestHandler> = {}): void {
  Object.keys(resources).forEach(path => {
    app.use(path, resources[path])
  })
}
