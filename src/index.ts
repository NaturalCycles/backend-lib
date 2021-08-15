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
  getRequestContextProperty,
  setRequestContextProperty,
  requestContextMiddleware,
  requestIdMiddleware,
  REQUEST_ID_KEY,
  validateBody,
  validateParams,
  validateQuery,
}

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PORT?: string
      GAE_APPLICATION?: string
      GAE_SERVICE?: string
      GAE_VERSION?: string
    }
  }
}
