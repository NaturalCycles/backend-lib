import * as cookieParser from 'cookie-parser'
import * as cors from 'cors'
import { Application, RequestHandler } from 'express'
import * as express from 'express'
import * as helmet from 'helmet'
import { methodOverride, SentrySharedService } from '..'
import { DefaultAppCfg } from './createDefaultApp.model'
import { bodyParserTimeout, clearBodyParserTimeout } from './handlers/bodyParserTimeout.mw'
import { genericErrorHandler } from './handlers/genericErrorHandler.mw'
import { notFoundHandler } from './handlers/notFoundHandler.mw'
import { requestTimeout } from './handlers/requestTimeout.mw'
import { sentryErrorHandler } from './handlers/sentryErrorHandler.mw'
import { simpleRequestLogger } from './handlers/simpleRequestLogger.mw'

export function createDefaultApp (
  defaultAppCfg: DefaultAppCfg,
  sentryService?: SentrySharedService,
): Application {
  const app = express()

  app.disable('etag')
  app.set('trust proxy', true)

  // preHandlers
  useHandlers(app, defaultAppCfg.preHandlers)

  app.use(methodOverride())
  app.use(requestTimeout())
  app.use(bodyParserTimeout())
  app.use(simpleRequestLogger())

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

  app.use(clearBodyParserTimeout())

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
  app.use(notFoundHandler())

  // The error handler must be before any other error middleware
  // NO: Generic error handler chooses which errors to report to sentry
  // OR: another handler that will selectively report to Sentry and pass error further via next(err)
  // app.use(sentryService.getErrorHandler())
  if (sentryService) {
    app.use(
      sentryErrorHandler({
        sentryService,
      }),
    )
  }

  // Generic error handler
  // It handles errors, returns proper status, does sentry.captureException()
  // It only rethrows error that happen in errorHandlerMiddleware itself ("error in errorHandler"),
  // otherwise there is no more error propagation behind it
  app.use(genericErrorHandler())

  return app
}

function useHandlers (app: Application, handlers: RequestHandler[] = []): void {
  handlers.forEach(handler => {
    app.use(handler)
  })
}

function useResources (app: Application, resources: Record<string, RequestHandler> = {}): void {
  Object.keys(resources).forEach(path => {
    app.use(path, resources[path])
  })
}
