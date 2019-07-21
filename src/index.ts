import { BaseEnv } from './env/env.model'
import { EnvSharedService, EnvSharedServiceCfg } from './env/env.shared.service'
import { isGAE } from './gae/appEngine.util'
import { SentrySharedServiceCfg } from './sentry/sentry.model'
import { SentrySharedService } from './sentry/sentry.shared.service'
import { catchWrapper } from './server/catchWrapper'
import { createDefaultApp } from './server/createDefaultApp'
import { getDeployInfo } from './server/deployInfo.util'
import { getDefaultRouter } from './server/getDefaultRouter'
import { genericErrorHandler } from './server/handlers/generic.error.handler'
import { notFoundHandler } from './server/handlers/notFound.handler'
import { reqValidationMiddleware } from './server/handlers/reqValidation.mw'
import { createRootHandler } from './server/handlers/root.handler'
import { sentryErrorMiddleware } from './server/handlers/sentry.error.mw'
import { BackendServer, startServer } from './server/startServer'
import { StartServerCfg, StartServerData } from './server/startServer.model'
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
  BackendServer,
  startServer,
  StartServerCfg,
  StartServerData,
  SlackSharedService,
  SlackSharedServiceCfg,
  SlackMessage,
  catchWrapper,
  getDefaultRouter,
  // resourceTestService, // no, cause it will require 'supertest' production dependency
  EnvSharedService,
  EnvSharedServiceCfg,
  BaseEnv,
  isGAE,
  createRootHandler,
  getDeployInfo,
}
