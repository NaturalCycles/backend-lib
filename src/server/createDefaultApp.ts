import cookieParser = require('cookie-parser')
import cors = require('cors')
import type { Application } from 'express'
import express = require('express')
import { isGAE, methodOverride } from '..'
import { DefaultAppCfg, RequestHandlerCfg, RequestHandlerWithPath } from './createDefaultApp.model'
import { createAsyncLocalStorage } from './handlers/asyncLocalStorage.mw'
import { createGAELogMiddleware } from './handlers/createGaeLogMiddleware'
import { genericErrorHandler } from './handlers/genericErrorHandler.mw'
import { notFoundHandler } from './handlers/notFoundHandler.mw'
import { requestTimeout } from './handlers/requestTimeout.mw'
import { simpleRequestLogger } from './handlers/simpleRequestLogger.mw'

const isTest = process.env['APP_ENV'] === 'test'

export function createDefaultApp(cfg: DefaultAppCfg): Application {
  const { sentryService } = cfg

  const app = express()

  app.disable('etag')
  app.disable('x-powered-by')
  app.set('trust proxy', true)

  // preHandlers
  useHandlers(app, cfg.preHandlers)

  app.use(createGAELogMiddleware())

  if (!isTest) {
    app.use(createAsyncLocalStorage())
  }

  // The request handler must be the first middleware on the app
  if (sentryService) {
    // On error - this handler will set res.headers,
    // which will trigger genericErrorHandler "headers already sent"
    app.use(sentryService.getRequestHandler())
  }

  app.use(methodOverride())
  app.use(requestTimeout())
  // app.use(serverStatsMiddleware()) // disabled by default
  // app.use(bodyParserTimeout()) // removed by default

  if (!isGAE() && !isTest) {
    app.use(simpleRequestLogger())
  }

  // app.use(safeJsonMiddleware()) // optional
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
      // methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // default
      maxAge: 86400,
    }),
  )

  // app.use(clearBodyParserTimeout()) // removed by default

  // Static is now disabled by default due to performance
  // Without: 6500 rpsAvg
  // With: 5200 rpsAvg (-20%)
  // app.use(express.static('static'))

  // Handlers
  useHandlers(app, cfg.handlers)

  // Resources
  useHandlers(app, cfg.resources)

  // postHandlers
  useHandlers(app, cfg.postHandlers)

  // Generic 404 handler
  app.use(notFoundHandler())

  // Generic error handler
  // It handles errors, returns proper status, does sentry.captureException(),
  // assigns err.data.errorId from sentry
  app.use(genericErrorHandler({ sentryService }))

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
