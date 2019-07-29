import { BaseEnv } from './env/env.model'
import { EnvSharedService, EnvSharedServiceCfg } from './env/env.shared.service'
import { isGAE } from './gae/appEngine.util'
import { SentrySharedServiceCfg } from './sentry/sentry.model'
import { SentrySharedService } from './sentry/sentry.shared.service'
import { catchWrapper } from './server/catchWrapper'
import { createDefaultApp } from './server/createDefaultApp'
import { getDeployInfo } from './server/deployInfo.util'
import { getDefaultRouter } from './server/getDefaultRouter'
import { genericErrorHandler } from './server/handlers/genericErrorHandler.mw'
import { methodOverride } from './server/handlers/methodOverride.mw'
import { notFoundHandler } from './server/handlers/notFoundHandler.mw'
import { reqValidation } from './server/handlers/reqValidation.mw'
import { rootHandler } from './server/handlers/root.handler'
import { sentryErrorHandler } from './server/handlers/sentryErrorHandler.mw'
import { BackendServer, startServer } from './server/startServer'
import { StartServerCfg, StartServerData } from './server/startServer.model'
import { SlackSharedService } from './slack/slack.shared.service'
import { SlackMessage, SlackSharedServiceCfg } from './slack/slack.shared.service.model'

export {
  reqValidation,
  notFoundHandler,
  genericErrorHandler,
  methodOverride,
  sentryErrorHandler,
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
  rootHandler,
  getDeployInfo,
}
