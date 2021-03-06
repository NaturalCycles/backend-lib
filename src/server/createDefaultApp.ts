import cookieParser = require('cookie-parser')
import cors = require('cors')
import type { Application } from 'express'
import express = require('express')
import { methodOverride, SentrySharedService } from '..'
import { DefaultAppCfg, RequestHandlerCfg, RequestHandlerWithPath } from './createDefaultApp.model'
import { bodyParserTimeout, clearBodyParserTimeout } from './handlers/bodyParserTimeout.mw'
import { genericErrorHandler } from './handlers/genericErrorHandler.mw'
import { notFoundHandler } from './handlers/notFoundHandler.mw'
import { requestContextMiddleware } from './handlers/requestContext.mw'
import { requestIdMiddleware } from './handlers/requestId.mw'
import { requestTimeout } from './handlers/requestTimeout.mw'
import { sentryErrorHandler } from './handlers/sentryErrorHandler.mw'
import { simpleRequestLogger } from './handlers/simpleRequestLogger.mw'

const isTest = process.env.APP_ENV === 'test'

export function createDefaultApp(
  defaultAppCfg: DefaultAppCfg,
  sentryService?: SentrySharedService,
): Application {
  const app = express()

  app.disable('etag')
  app.set('trust proxy', true)

  // preHandlers
  useHandlers(app, defaultAppCfg.preHandlers)

  if (!isTest) {
    // These middlewares use 'cls-hooked' which leaks memory after Namespace is once created
    app.use(requestContextMiddleware())
    app.use(requestIdMiddleware())
  }

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
  if (!isTest) {
    // leaks, load lazily
    app.use(
      require('helmet')({
        contentSecurityPolicy: false, // to allow "admin 401 auto-redirect"
      }),
    )
  }

  app.use(
    cors({
      origin: true,
      credentials: true,
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      maxAge: 86400,
    }),
  )
  app.options('*', cors() as any) // enable pre-flight for all requests

  app.use(clearBodyParserTimeout())

  app.use(express.static('static'))

  // Handlers
  useHandlers(app, defaultAppCfg.handlers)

  // Resources
  useHandlers(app, defaultAppCfg.resources)

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

function useHandlers(app: Application, handlers: RequestHandlerCfg[] = []): void {
  handlers
    .map<RequestHandlerWithPath>(cfg => {
      if (typeof cfg === 'function') {
        return {
          path: '/',
          handler: cfg,
        }
      }
      return cfg
    })
    .forEach(cfg => {
      app.use(cfg.path, cfg.handler)
    })
}
