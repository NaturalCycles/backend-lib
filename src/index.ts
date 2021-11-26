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
  BackendRequestHandlerCfg,
  BackendRequestHandlerWithPath,
} from './server/createDefaultApp.model'
import { getDeployInfo } from './server/deployInfo.util'
import { getDefaultRouter } from './server/getDefaultRouter'
import {
  bodyParserTimeoutMiddleware,
  BodyParserTimeoutMiddlewareCfg,
  clearBodyParserTimeout,
} from './server/bodyParserTimeoutMiddleware'
export * from './server/genericErrorMiddleware'
export * from './server/serverStatsMiddleware'
import {
  methodOverrideMiddleware,
  MethodOverrideMiddlewareCfg,
} from './server/methodOverrideMiddleware'
import { notFoundMiddleware } from './server/notFoundMiddleware'
import { okMiddleware } from './server/okMiddleware'
import {
  requestTimeoutMiddleware,
  RequestTimeoutMiddlewareCfg,
} from './server/requestTimeoutMiddleware'
import { reqValidation, ReqValidationOptions } from './server/reqValidationMiddleware'
import {
  simpleRequestLoggerMiddleware,
  SimpleRequestLoggerMiddlewareCfg,
} from './server/simpleRequestLoggerMiddleware'
import { serverStatusMiddleware, getServerStatusData } from './server/serverStatusMiddleware'
import { validateBody, validateParams, validateQuery } from './server/validateMiddleware'
import { coloredHttpCode, logRequest } from './server/request.log.util'
import { BackendServer, startServer } from './server/startServer'
import { StartServerCfg, StartServerData } from './server/startServer.model'
export * from './server/asyncLocalStorageMiddleware'
import type {
  BackendRequest,
  BackendRequestHandler,
  BackendResponse,
  BackendErrorRequestHandler,
  BackendRouter,
  BackendApplication,
} from './server/server.model'
export * from './server/appEngineLogMiddleware'
export * from './server/safeJsonMiddleware'
export * from './server/request.util'

export type {
  MethodOverrideMiddlewareCfg,
  SentrySharedServiceCfg,
  BackendRequestHandlerWithPath,
  BackendRequestHandlerCfg,
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
  BodyParserTimeoutMiddlewareCfg,
  RequestTimeoutMiddlewareCfg,
  SimpleRequestLoggerMiddlewareCfg,
  ReqValidationOptions,
  BackendRequest,
  BackendRequestHandler,
  BackendResponse,
  BackendErrorRequestHandler,
  BackendRouter,
  BackendApplication,
}

export {
  BackendServer,
  SentrySharedService,
  EnvSharedService,
  reqValidation,
  notFoundMiddleware,
  methodOverrideMiddleware,
  createDefaultApp,
  startServer,
  catchWrapper,
  getDefaultRouter,
  isGAE,
  serverStatusMiddleware,
  getServerStatusData,
  okMiddleware,
  getDeployInfo,
  onFinished,
  logRequest,
  FirebaseSharedService,
  createAdminMiddleware,
  BaseAdminService,
  loginHtml,
  createSecureHeaderMiddleware,
  bodyParserTimeoutMiddleware,
  clearBodyParserTimeout,
  requestTimeoutMiddleware,
  simpleRequestLoggerMiddleware,
  coloredHttpCode,
  validateBody,
  validateParams,
  validateQuery,
}
