import onFinished = require('on-finished')
import {
  AdminMiddleware,
  createAdminMiddleware,
  loginHtml,
  RequireAdminCfg,
} from './admin/admin.mw'
import { AdminInfo, AdminServiceCfg, BaseAdminService } from './admin/base.admin.service'
import { FirebaseSharedService } from './admin/firebase.shared.service'
import { createSecureHeaderMiddleware, SecureHeaderMiddlewareCfg } from './admin/secureHeader.mw'
import { BaseEnv } from './env/env.model'
import { EnvSharedService, EnvSharedServiceCfg } from './env/env.shared.service'
import { isGAE } from './gae/appEngine.util'
import { SentrySharedService, SentrySharedServiceCfg } from './sentry/sentry.shared.service'
import { catchWrapper } from './server/catchWrapper'
import { createDefaultApp } from './server/createDefaultApp'
import {
  DefaultAppCfg,
  RequestHandlerCfg,
  RequestHandlerWithPath,
} from './server/createDefaultApp.model'
import { getDeployInfo } from './server/deployInfo.util'
import { getDefaultRouter } from './server/getDefaultRouter'
import {
  bodyParserTimeout,
  BodyParserTimeoutCfg,
  clearBodyParserTimeout,
} from './server/handlers/bodyParserTimeout.mw'
import { genericErrorHandler, respondWithError } from './server/handlers/genericErrorHandler.mw'
import {
  serverStatsHTMLHandler,
  serverStatsMiddleware,
} from './server/handlers/serverStatsMiddleware'
import { methodOverride, MethodOverrideCfg } from './server/handlers/methodOverride.mw'
import { notFoundHandler } from './server/handlers/notFoundHandler.mw'
import { okHandler } from './server/handlers/okHandler.mw'
import { requestTimeout, RequestTimeoutCfg } from './server/handlers/requestTimeout.mw'
import { reqValidation, ReqValidationOptions } from './server/handlers/reqValidation.mw'
import { sentryErrorHandler } from './server/handlers/sentryErrorHandler.mw'
import {
  simpleRequestLogger,
  SimpleRequestLoggerCfg,
} from './server/handlers/simpleRequestLogger.mw'
import { statusHandler, statusHandlerData } from './server/handlers/statusHandler'
import { validateBody, validateParams, validateQuery } from './server/handlers/validate.mw'
import { coloredHttpCode, logRequest } from './server/request.log.util'
import { BackendServer, startServer } from './server/startServer'
import { StartServerCfg, StartServerData } from './server/startServer.model'
import {
  createAsyncLocalStorage,
  getRequest,
  getRequestLogger,
} from './server/handlers/asyncLocalStorage.mw'
import { createGAELogMiddleware } from './server/handlers/createGaeLogMiddleware'

export type {
  MethodOverrideCfg,
  SentrySharedServiceCfg,
  RequestHandlerWithPath,
  RequestHandlerCfg,
  DefaultAppCfg,
  StartServerCfg,
  StartServerData,
  EnvSharedServiceCfg,
  BaseEnv,
  AdminMiddleware,
  AdminServiceCfg,
  AdminInfo,
  RequireAdminCfg,
  SecureHeaderMiddlewareCfg,
  BodyParserTimeoutCfg,
  RequestTimeoutCfg,
  SimpleRequestLoggerCfg,
  ReqValidationOptions,
}

export {
  BackendServer,
  SentrySharedService,
  EnvSharedService,
  reqValidation,
  notFoundHandler,
  genericErrorHandler,
  methodOverride,
  sentryErrorHandler,
  createDefaultApp,
  startServer,
  catchWrapper,
  getDefaultRouter,
  isGAE,
  statusHandler,
  statusHandlerData,
  okHandler,
  getDeployInfo,
  onFinished,
  respondWithError,
  logRequest,
  FirebaseSharedService,
  createAdminMiddleware,
  BaseAdminService,
  loginHtml,
  createSecureHeaderMiddleware,
  bodyParserTimeout,
  clearBodyParserTimeout,
  requestTimeout,
  simpleRequestLogger,
  coloredHttpCode,
  validateBody,
  validateParams,
  validateQuery,
  createAsyncLocalStorage,
  createGAELogMiddleware,
  getRequest,
  getRequestLogger,
  serverStatsHTMLHandler,
  serverStatsMiddleware,
}
