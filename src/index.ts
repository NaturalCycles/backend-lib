import { SentrySharedServiceCfg } from './sentry/sentry.model'
import { SentrySharedService } from './sentry/sentry.shared.service'
import { BootstrapSharedService } from './server/bootstrap.shared.service'
import { BootstrapSharedServiceCfg } from './server/bootstrap.shared.service.model'
import { catchWrapper } from './server/catchWrapper'
import { createDefaultApp } from './server/createDefaultApp'
import { getDefaultRouter } from './server/getDefaultRouter'
import { genericErrorHandler } from './server/handlers/generic.error.handler'
import { notFoundHandler } from './server/handlers/notFound.handler'
import { reqValidationMiddleware } from './server/handlers/reqValidation.mw'
import { sentryErrorMiddleware } from './server/handlers/sentry.error.mw'
import { serverSharedService } from './server/server.shared.service'
import { SlackSharedService } from './slack/slack.shared.service'
import { SlackMessage, SlackSharedServiceCfg } from './slack/slack.shared.service.model'

export {
  reqValidationMiddleware,
  notFoundHandler,
  genericErrorHandler,
  sentryErrorMiddleware,
  SentrySharedService,
  SentrySharedServiceCfg,
  createDefaultApp,
  BootstrapSharedService,
  BootstrapSharedServiceCfg,
  serverSharedService,
  SlackSharedService,
  SlackSharedServiceCfg,
  SlackMessage,
  catchWrapper,
  getDefaultRouter,
  // resourceTestService, // no, cause it will require 'supertest' production dependency
}
