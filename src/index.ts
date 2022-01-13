import onFinished = require('on-finished')
import {
  AdminMiddleware,
  createAdminMiddleware,
  loginHtml,
  RequireAdminCfg,
} from './admin/adminMiddleware'
import { AdminInfo, AdminServiceCfg, BaseAdminService } from './admin/base.admin.service'
import { FirebaseSharedService } from './admin/firebase.shared.service'
import {
  createSecureHeaderMiddleware,
  SecureHeaderMiddlewareCfg,
} from './admin/secureHeaderMiddleware'
import { BaseEnv } from './env/env.model'
import { EnvSharedService, EnvSharedServiceCfg } from './env/env.shared.service'
export * from './gae/appEngine.util'
import { SentrySharedService, SentrySharedServiceCfg } from './sentry/sentry.shared.service'
export * from './server/catchWrapper'
export * from './server/createDefaultApp'
import {
  DefaultAppCfg,
  BackendRequestHandlerCfg,
  BackendRequestHandlerWithPath,
} from './server/createDefaultApp.model'
export * from './server/deployInfo.util'
export * from './server/getDefaultRouter'
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
export * from './server/notFoundMiddleware'
export * from './server/okMiddleware'
import { RequestTimeoutMiddlewareCfg } from './server/requestTimeoutMiddleware'
export * from './server/requestTimeoutMiddleware'
import { reqValidation, ReqValidationOptions } from './server/reqValidationMiddleware'
import {
  simpleRequestLoggerMiddleware,
  SimpleRequestLoggerMiddlewareCfg,
} from './server/simpleRequestLoggerMiddleware'
import { serverStatusMiddleware, getServerStatusData } from './server/serverStatusMiddleware'
export * from './server/validateMiddleware'
export * from './server/request.log.util'
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
  methodOverrideMiddleware,
  startServer,
  serverStatusMiddleware,
  getServerStatusData,
  onFinished,
  FirebaseSharedService,
  createAdminMiddleware,
  BaseAdminService,
  loginHtml,
  createSecureHeaderMiddleware,
  bodyParserTimeoutMiddleware,
  clearBodyParserTimeout,
  simpleRequestLoggerMiddleware,
}
