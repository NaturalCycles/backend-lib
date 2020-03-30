import * as onFinished from 'on-finished'
import {
  AdminMiddleware,
  createAdminMiddleware,
  loginHtml,
  RequireAdminCfg,
} from './admin/admin.mw'
import { AdminInfo, AdminServiceCfg, BaseAdminService } from './admin/base.admin.service'
import { FirebaseSharedService } from './admin/firebase.shared.service'
import { createSecureHeaderMiddleware, SecureHeaderMiddlewareCfg } from './admin/secureHeader.mw'
import { BackendCfg, getBackendCfg } from './backend.cfg.util'
import { BaseEnv } from './env/env.model'
import { EnvSharedService, EnvSharedServiceCfg } from './env/env.shared.service'
import { isGAE } from './gae/appEngine.util'
import { createAppYaml, createDeployInfo, DeployInfo } from './gae/deploy.util'
import { SentrySharedServiceCfg } from './sentry/sentry.model'
import { SentrySharedService } from './sentry/sentry.shared.service'
import { catchWrapper } from './server/catchWrapper'
import { createDefaultApp } from './server/createDefaultApp'
import {
  DefaultAppCfg,
  RequestHandlerCfg,
  RequestHandlerWithPath,
} from './server/createDefaultApp.model'
import { getDeployInfo } from './server/deployInfo.util'
import { respondWithError } from './server/error.util'
import { getDefaultRouter } from './server/getDefaultRouter'
import {
  bodyParserTimeout,
  BodyParserTimeoutCfg,
  clearBodyParserTimeout,
} from './server/handlers/bodyParserTimeout.mw'
import { genericErrorHandler } from './server/handlers/genericErrorHandler.mw'
import { methodOverride, MethodOverrideCfg } from './server/handlers/methodOverride.mw'
import { notFoundHandler } from './server/handlers/notFoundHandler.mw'
import { okHandler } from './server/handlers/okHandler.mw'
import {
  getRequestContextProperty,
  requestContextMiddleware,
  setRequestContextProperty,
} from './server/handlers/requestContext.mw'
import { requestIdMiddleware, REQUEST_ID_KEY } from './server/handlers/requestId.mw'
import { requestTimeout, RequestTimeoutCfg } from './server/handlers/requestTimeout.mw'
import { reqValidation } from './server/handlers/reqValidation.mw'
import { sentryErrorHandler } from './server/handlers/sentryErrorHandler.mw'
import {
  simpleRequestLogger,
  SimpleRequestLoggerCfg,
} from './server/handlers/simpleRequestLogger.mw'
import { statusHandler, statusHandlerData } from './server/handlers/statusHandler'
import { coloredHttpCode, logRequest } from './server/request.log.util'
import { BackendServer, startServer } from './server/startServer'
import { StartServerCfg, StartServerData } from './server/startServer.model'

export {
  reqValidation,
  notFoundHandler,
  genericErrorHandler,
  MethodOverrideCfg,
  methodOverride,
  sentryErrorHandler,
  SentrySharedService,
  SentrySharedServiceCfg,
  RequestHandlerWithPath,
  RequestHandlerCfg,
  DefaultAppCfg,
  createDefaultApp,
  BackendServer,
  startServer,
  StartServerCfg,
  StartServerData,
  catchWrapper,
  getDefaultRouter,
  // resourceTestService, // no, cause it will require 'supertest' production dependency
  EnvSharedService,
  EnvSharedServiceCfg,
  BaseEnv,
  isGAE,
  statusHandler,
  statusHandlerData,
  okHandler,
  getDeployInfo,
  onFinished,
  respondWithError,
  logRequest,
  FirebaseSharedService,
  AdminMiddleware,
  createAdminMiddleware,
  AdminServiceCfg,
  AdminInfo,
  BaseAdminService,
  loginHtml,
  RequireAdminCfg,
  SecureHeaderMiddlewareCfg,
  createSecureHeaderMiddleware,
  BodyParserTimeoutCfg,
  bodyParserTimeout,
  clearBodyParserTimeout,
  RequestTimeoutCfg,
  requestTimeout,
  SimpleRequestLoggerCfg,
  simpleRequestLogger,
  coloredHttpCode,
  getRequestContextProperty,
  setRequestContextProperty,
  requestContextMiddleware,
  requestIdMiddleware,
  REQUEST_ID_KEY,
  getBackendCfg,
  BackendCfg,
  createDeployInfo,
  createAppYaml,
  DeployInfo,
}
