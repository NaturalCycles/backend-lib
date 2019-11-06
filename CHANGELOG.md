# [2.36.0](https://github.com/NaturalCycles/backend-lib/compare/v2.35.1...v2.36.0) (2019-11-06)


### Features

* remove swagger-stats support ([7a4e00d](https://github.com/NaturalCycles/backend-lib/commit/7a4e00d33a41c39aad0ba26ed75e3d1efd67e93a))

## [2.35.1](https://github.com/NaturalCycles/backend-lib/compare/v2.35.0...v2.35.1) (2019-11-02)


### Bug Fixes

* GCP LoadBalancer race condition (!) ([a940b15](https://github.com/NaturalCycles/backend-lib/commit/a940b15d3b928906ef53cc167e132f3a4183b893))

# [2.35.0](https://github.com/NaturalCycles/backend-lib/compare/v2.34.0...v2.35.0) (2019-10-30)


### Features

* startServer to return instance of Server ([780a99d](https://github.com/NaturalCycles/backend-lib/commit/780a99d40354229a93465ffeb9d54e687448869e))

# [2.34.0](https://github.com/NaturalCycles/backend-lib/compare/v2.33.1...v2.34.0) (2019-10-30)


### Features

* **sentry:** maxValueLength=2000 (was: 250), +breadcrumb ([3e0aa70](https://github.com/NaturalCycles/backend-lib/commit/3e0aa708d11e200bf32515250bccebe172bab59c))

## [2.33.1](https://github.com/NaturalCycles/backend-lib/compare/v2.33.0...v2.33.1) (2019-10-24)


### Bug Fixes

* process.resourceUsage is node12.6+ ([cb89358](https://github.com/NaturalCycles/backend-lib/commit/cb89358efe38dceb2c59ab96a9759908d8c440b2))

# [2.33.0](https://github.com/NaturalCycles/backend-lib/compare/v2.32.0...v2.33.0) (2019-10-24)


### Features

* statusHandler to include versions and resourceUsage ([e2fd86c](https://github.com/NaturalCycles/backend-lib/commit/e2fd86c534b05eac8c6ad93f50ed90aa9bb001c9))

# [2.32.0](https://github.com/NaturalCycles/backend-lib/compare/v2.31.1...v2.32.0) (2019-10-22)


### Features

* **deploy:** runtime=nodejs12 by default (was: nodejs10) ([827690d](https://github.com/NaturalCycles/backend-lib/commit/827690db10f6e2c256bcde0c975c225c26853d6c))

## [2.31.1](https://github.com/NaturalCycles/backend-lib/compare/v2.31.0...v2.31.1) (2019-10-17)


### Bug Fixes

* `yargs` not found when doing `yarn deploy` ([04a4d13](https://github.com/NaturalCycles/backend-lib/commit/04a4d13))

# [2.31.0](https://github.com/NaturalCycles/backend-lib/compare/v2.30.0...v2.31.0) (2019-10-17)


### Bug Fixes

* @types/joi resolution bug ([5c6b0a5](https://github.com/NaturalCycles/backend-lib/commit/5c6b0a5))
* use execCommand instead of execShell ([7598a40](https://github.com/NaturalCycles/backend-lib/commit/7598a40))


### Features

* export more deploy.util functions ([297a328](https://github.com/NaturalCycles/backend-lib/commit/297a328))

# [2.30.0](https://github.com/NaturalCycles/backend-lib/compare/v2.29.0...v2.30.0) (2019-10-03)


### Features

* SlackService is moved to nodejs-lib ([0a8077e](https://github.com/NaturalCycles/backend-lib/commit/0a8077e))
* support backend.cfg in yaml format ([3e13256](https://github.com/NaturalCycles/backend-lib/commit/3e13256))

# [2.29.0](https://github.com/NaturalCycles/backend-lib/compare/v2.28.0...v2.29.0) (2019-09-24)


### Features

* use 'x-cloud-trace-context' as requestId if available ([2a8f1ae](https://github.com/NaturalCycles/backend-lib/commit/2a8f1ae))

# [2.28.0](https://github.com/NaturalCycles/backend-lib/compare/v2.27.0...v2.28.0) (2019-09-24)


### Features

* requestContextMiddleware (powered by cls-hooked) ([17efe32](https://github.com/NaturalCycles/backend-lib/commit/17efe32))

# [2.27.0](https://github.com/NaturalCycles/backend-lib/compare/v2.26.1...v2.27.0) (2019-09-21)


### Features

* cfg/tsconfig lib without "dom" (add it back if needed) ([6071eba](https://github.com/NaturalCycles/backend-lib/commit/6071eba))

## [2.26.1](https://github.com/NaturalCycles/backend-lib/compare/v2.26.0...v2.26.1) (2019-09-20)


### Bug Fixes

* return await ([25ff61b](https://github.com/NaturalCycles/backend-lib/commit/25ff61b))

# [2.26.0](https://github.com/NaturalCycles/backend-lib/compare/v2.25.0...v2.26.0) (2019-09-13)


### Features

* genericErrorHandler log error on "headersSent" ([8afa060](https://github.com/NaturalCycles/backend-lib/commit/8afa060))

# [2.25.0](https://github.com/NaturalCycles/backend-lib/compare/v2.24.2...v2.25.0) (2019-09-10)


### Features

* RequestHandlerWithPath, RequestHandlerCfg ([4d474f2](https://github.com/NaturalCycles/backend-lib/commit/4d474f2))

## [2.24.2](https://github.com/NaturalCycles/backend-lib/compare/v2.24.1...v2.24.2) (2019-08-30)


### Bug Fixes

* req.cookies being undefined ([15fdf89](https://github.com/NaturalCycles/backend-lib/commit/15fdf89))

## [2.24.1](https://github.com/NaturalCycles/backend-lib/compare/v2.24.0...v2.24.1) (2019-08-29)


### Bug Fixes

* backend.cfg schema to include branchesWithTimestampVersions ([99f1224](https://github.com/NaturalCycles/backend-lib/commit/99f1224))

# [2.24.0](https://github.com/NaturalCycles/backend-lib/compare/v2.23.0...v2.24.0) (2019-08-29)


### Features

* revert serviceUrl to include 'default' ([8971ccf](https://github.com/NaturalCycles/backend-lib/commit/8971ccf))

# [2.23.0](https://github.com/NaturalCycles/backend-lib/compare/v2.22.0...v2.23.0) (2019-08-29)


### Features

* gaeServiceUrl to strip 'default' from ([7379bfe](https://github.com/NaturalCycles/backend-lib/commit/7379bfe))

# [2.22.0](https://github.com/NaturalCycles/backend-lib/compare/v2.21.0...v2.22.0) (2019-08-29)


### Features

* backend.cfg.json gaeServiceByBranch ([dcb3384](https://github.com/NaturalCycles/backend-lib/commit/dcb3384))

# [2.21.0](https://github.com/NaturalCycles/backend-lib/compare/v2.20.1...v2.21.0) (2019-08-29)


### Features

* **admin:** allow admin_token in http header ([306e8ac](https://github.com/NaturalCycles/backend-lib/commit/306e8ac))

## [2.20.1](https://github.com/NaturalCycles/backend-lib/compare/v2.20.0...v2.20.1) (2019-08-29)


### Bug Fixes

* isAdmin to ignore authEnabled ([e51206a](https://github.com/NaturalCycles/backend-lib/commit/e51206a))

# [2.20.0](https://github.com/NaturalCycles/backend-lib/compare/v2.19.0...v2.20.0) (2019-08-29)


### Features

* revert REQUEST type since it's incompatible with mw ([726dbd3](https://github.com/NaturalCycles/backend-lib/commit/726dbd3))

# [2.19.0](https://github.com/NaturalCycles/backend-lib/compare/v2.18.0...v2.19.0) (2019-08-29)


### Features

* adminService to have generic REQUEST type ([85f2daa](https://github.com/NaturalCycles/backend-lib/commit/85f2daa))

# [2.18.0](https://github.com/NaturalCycles/backend-lib/compare/v2.17.0...v2.18.0) (2019-08-29)


### Features

* adminService improvements ([f8fa4a9](https://github.com/NaturalCycles/backend-lib/commit/f8fa4a9))
* createSecureHeaderMiddleware() ([5832903](https://github.com/NaturalCycles/backend-lib/commit/5832903))

# [2.17.0](https://github.com/NaturalCycles/backend-lib/compare/v2.16.0...v2.17.0) (2019-08-29)


### Features

* admin.mw to pass apiHost ([9aff4b7](https://github.com/NaturalCycles/backend-lib/commit/9aff4b7))
* **deploy:** serviceWithBranchName boolean flag ([9670c00](https://github.com/NaturalCycles/backend-lib/commit/9670c00))

# [2.16.0](https://github.com/NaturalCycles/backend-lib/compare/v2.15.1...v2.16.0) (2019-08-28)


### Features

* createAdminMiddleware(..., cfg) ([6c9180a](https://github.com/NaturalCycles/backend-lib/commit/6c9180a))

## [2.15.1](https://github.com/NaturalCycles/backend-lib/compare/v2.15.0...v2.15.1) (2019-08-28)


### Bug Fixes

* **slack:** async decorateMsg ([987c3db](https://github.com/NaturalCycles/backend-lib/commit/987c3db))

# [2.15.0](https://github.com/NaturalCycles/backend-lib/compare/v2.14.0...v2.15.0) (2019-08-27)


### Features

* **deploy:** log redacted appYaml ([fdac0d2](https://github.com/NaturalCycles/backend-lib/commit/fdac0d2))

# [2.14.0](https://github.com/NaturalCycles/backend-lib/compare/v2.13.0...v2.14.0) (2019-08-27)


### Features

* decouple firebaseService / adminService ([b251ac5](https://github.com/NaturalCycles/backend-lib/commit/b251ac5))

# [2.13.0](https://github.com/NaturalCycles/backend-lib/compare/v2.12.0...v2.13.0) (2019-08-27)


### Features

* faster no-timestamp deploy (skips "rollout") ([1b51d34](https://github.com/NaturalCycles/backend-lib/commit/1b51d34))
* **deploy:** merge-in app.${env}.yaml ([06a0c88](https://github.com/NaturalCycles/backend-lib/commit/06a0c88))

# [2.12.0](https://github.com/NaturalCycles/backend-lib/compare/v2.11.2...v2.12.0) (2019-08-27)


### Bug Fixes

* app.yaml DEBUG include app* ([c575aa4](https://github.com/NaturalCycles/backend-lib/commit/c575aa4))


### Features

* FirebaseSharedService ([53c427c](https://github.com/NaturalCycles/backend-lib/commit/53c427c))

## [2.11.2](https://github.com/NaturalCycles/backend-lib/compare/v2.11.1...v2.11.2) (2019-08-25)


### Bug Fixes

* slack log[level] ([8b8cdec](https://github.com/NaturalCycles/backend-lib/commit/8b8cdec))

## [2.11.1](https://github.com/NaturalCycles/backend-lib/compare/v2.11.0...v2.11.1) (2019-08-25)


### Bug Fixes

* slack.error with level=error ([8fc1831](https://github.com/NaturalCycles/backend-lib/commit/8fc1831))

# [2.11.0](https://github.com/NaturalCycles/backend-lib/compare/v2.10.0...v2.11.0) (2019-08-25)


### Features

* slack.error, slack.channelByLevel ([55d05fd](https://github.com/NaturalCycles/backend-lib/commit/55d05fd))

# [2.10.0](https://github.com/NaturalCycles/backend-lib/compare/v2.9.0...v2.10.0) (2019-08-25)


### Features

* statusHandlerData ([a113108](https://github.com/NaturalCycles/backend-lib/commit/a113108))

# [2.9.0](https://github.com/NaturalCycles/backend-lib/compare/v2.8.0...v2.9.0) (2019-08-25)


### Features

* colors, slack GAE decoration ([0f98fa2](https://github.com/NaturalCycles/backend-lib/commit/0f98fa2))

# [2.8.0](https://github.com/NaturalCycles/backend-lib/compare/v2.7.1...v2.8.0) (2019-08-24)


### Features

* rootHandler > statusHandler ([0a1fef6](https://github.com/NaturalCycles/backend-lib/commit/0a1fef6))

## [2.7.1](https://github.com/NaturalCycles/backend-lib/compare/v2.7.0...v2.7.1) (2019-08-24)


### Bug Fixes

* allow appYamlPassEnv in backend.cfg ([d83941b](https://github.com/NaturalCycles/backend-lib/commit/d83941b))

# [2.7.0](https://github.com/NaturalCycles/backend-lib/compare/v2.6.2...v2.7.0) (2019-08-24)


### Features

* yarn deploy-gae --appYamlPassEnv=AA,BB ([bdf33b4](https://github.com/NaturalCycles/backend-lib/commit/bdf33b4))

## [2.6.2](https://github.com/NaturalCycles/backend-lib/compare/v2.6.1...v2.6.2) (2019-08-18)


### Bug Fixes

* deps ([0e12ceb](https://github.com/NaturalCycles/backend-lib/commit/0e12ceb))

## [2.6.1](https://github.com/NaturalCycles/backend-lib/compare/v2.6.0...v2.6.1) (2019-08-17)


### Bug Fixes

* DEBUG env var defaults ([93e88e6](https://github.com/NaturalCycles/backend-lib/commit/93e88e6))

# [2.6.0](https://github.com/NaturalCycles/backend-lib/compare/v2.5.1...v2.6.0) (2019-08-17)


### Features

* admin, more middlewares (timeout, logger) ([667ae23](https://github.com/NaturalCycles/backend-lib/commit/667ae23))
* bench.md with plots ([c30cb0d](https://github.com/NaturalCycles/backend-lib/commit/c30cb0d))
* benchAll ([aaf9acb](https://github.com/NaturalCycles/backend-lib/commit/aaf9acb))
* improve logging ([34e36f6](https://github.com/NaturalCycles/backend-lib/commit/34e36f6))

## [2.5.1](https://github.com/NaturalCycles/backend-lib/compare/v2.5.0...v2.5.1) (2019-08-10)


### Bug Fixes

* test ([53f4830](https://github.com/NaturalCycles/backend-lib/commit/53f4830))

# [2.5.0](https://github.com/NaturalCycles/backend-lib/compare/v2.4.0...v2.5.0) (2019-08-10)


### Features

* use Debug from nodejs-lib for logging ([48f707a](https://github.com/NaturalCycles/backend-lib/commit/48f707a))

# [2.4.0](https://github.com/NaturalCycles/backend-lib/compare/v2.3.0...v2.4.0) (2019-07-30)


### Features

* slackService.kvToFields() ([fdd0246](https://github.com/NaturalCycles/backend-lib/commit/fdd0246))

# [2.3.0](https://github.com/NaturalCycles/backend-lib/compare/v2.2.0...v2.3.0) (2019-07-30)


### Features

* slackServiceCfg.log (default to true) ([b9a8954](https://github.com/NaturalCycles/backend-lib/commit/b9a8954))

# [2.2.0](https://github.com/NaturalCycles/backend-lib/compare/v2.1.0...v2.2.0) (2019-07-29)


### Features

* **slack:** msg.kv sugar syntax ([e31e451](https://github.com/NaturalCycles/backend-lib/commit/e31e451))

# [2.1.0](https://github.com/NaturalCycles/backend-lib/compare/v2.0.0...v2.1.0) (2019-07-29)


### Features

* **deploy:** logOnFailure, logOnSuccess ([15b421d](https://github.com/NaturalCycles/backend-lib/commit/15b421d))

# [2.0.0](https://github.com/NaturalCycles/backend-lib/compare/v1.16.1...v2.0.0) (2019-07-29)


### Code Refactoring

* all handlers are middlewares (factory functions) now ([fc756bb](https://github.com/NaturalCycles/backend-lib/commit/fc756bb))


### Features

* **slack:** allow attachments ([23775a4](https://github.com/NaturalCycles/backend-lib/commit/23775a4))
* gaeServiceName as `branch--service` ([7821727](https://github.com/NaturalCycles/backend-lib/commit/7821727))
* methodOverride middleware ([6f4fca3](https://github.com/NaturalCycles/backend-lib/commit/6f4fca3))
* SlackService to allow defaults, ctx ([c326ed1](https://github.com/NaturalCycles/backend-lib/commit/c326ed1))


### BREAKING CHANGES

* ^^^

## [1.16.1](https://github.com/NaturalCycles/backend-lib/compare/v1.16.0...v1.16.1) (2019-07-21)


### Bug Fixes

* export /cfg ([4a3abc8](https://github.com/NaturalCycles/backend-lib/commit/4a3abc8))

# [1.16.0](https://github.com/NaturalCycles/backend-lib/compare/v1.15.0...v1.16.0) (2019-07-21)


### Bug Fixes

* log less in dev ([23b1d97](https://github.com/NaturalCycles/backend-lib/commit/23b1d97))


### Features

* cfg/tsconfig.json ([a11be44](https://github.com/NaturalCycles/backend-lib/commit/a11be44))
* refactor BoostrapSharedService into startServer() ([3441eae](https://github.com/NaturalCycles/backend-lib/commit/3441eae))

# [1.15.0](https://github.com/NaturalCycles/backend-lib/compare/v1.14.1...v1.15.0) (2019-07-18)


### Bug Fixes

* update js-lib ([62f8716](https://github.com/NaturalCycles/backend-lib/commit/62f8716))


### Features

* getDeployInfo, extend rootHandler ([3aa4b24](https://github.com/NaturalCycles/backend-lib/commit/3aa4b24))

## [1.14.1](https://github.com/NaturalCycles/backend-lib/compare/v1.14.0...v1.14.1) (2019-07-18)


### Bug Fixes

* createRootHandler ([91466b3](https://github.com/NaturalCycles/backend-lib/commit/91466b3))

# [1.14.0](https://github.com/NaturalCycles/backend-lib/compare/v1.13.1...v1.14.0) (2019-07-17)


### Features

* root.handler ([f88ee4f](https://github.com/NaturalCycles/backend-lib/commit/f88ee4f))

## [1.13.1](https://github.com/NaturalCycles/backend-lib/compare/v1.13.0...v1.13.1) (2019-07-16)


### Bug Fixes

* use process.env.PORT if available ([ba43e5e](https://github.com/NaturalCycles/backend-lib/commit/ba43e5e))

# [1.13.0](https://github.com/NaturalCycles/backend-lib/compare/v1.12.1...v1.13.0) (2019-07-16)


### Features

* backend.cfg.json gaeProjectByBranch ([3ade6bc](https://github.com/NaturalCycles/backend-lib/commit/3ade6bc))
* deploy-gae --logs ([b18b5ea](https://github.com/NaturalCycles/backend-lib/commit/b18b5ea))

## [1.12.1](https://github.com/NaturalCycles/backend-lib/compare/v1.12.0...v1.12.1) (2019-07-16)


### Bug Fixes

* .gcloudignore ([2f4bc69](https://github.com/NaturalCycles/backend-lib/commit/2f4bc69))

# [1.12.0](https://github.com/NaturalCycles/backend-lib/compare/v1.11.1...v1.12.0) (2019-07-16)


### Features

* yarn deploy-gae ([18b92fc](https://github.com/NaturalCycles/backend-lib/commit/18b92fc))

## [1.11.1](https://github.com/NaturalCycles/backend-lib/compare/v1.11.0...v1.11.1) (2019-07-16)


### Bug Fixes

* deploy-prepare ([7af0355](https://github.com/NaturalCycles/backend-lib/commit/7af0355))

# [1.11.0](https://github.com/NaturalCycles/backend-lib/compare/v1.10.0...v1.11.0) (2019-07-16)


### Features

* yarn deploy-prepare, deploy-health-check ([a6f9fac](https://github.com/NaturalCycles/backend-lib/commit/a6f9fac))

# [1.10.0](https://github.com/NaturalCycles/backend-lib/compare/v1.9.0...v1.10.0) (2019-07-16)


### Features

* EnvSharedService, deps ([a72f968](https://github.com/NaturalCycles/backend-lib/commit/a72f968))

# [1.9.0](https://github.com/NaturalCycles/backend-lib/compare/v1.8.0...v1.9.0) (2019-05-20)


### Features

* update deps, upgraded some libs from peerDeps to deps ([b227e87](https://github.com/NaturalCycles/backend-lib/commit/b227e87))

# [1.8.0](https://github.com/NaturalCycles/backend-lib/compare/v1.7.0...v1.8.0) (2019-05-02)


### Features

* update nodejs-lib, dev-lib ([7487462](https://github.com/NaturalCycles/backend-lib/commit/7487462))

# [1.7.0](https://github.com/NaturalCycles/backend-lib/compare/v1.6.0...v1.7.0) (2019-03-30)


### Bug Fixes

* createDefaultApp postHandlers before notFoundHandler ([008789e](https://github.com/NaturalCycles/backend-lib/commit/008789e))


### Features

* **error-handler:** APP_ENV to affect err.stack ([02aa56c](https://github.com/NaturalCycles/backend-lib/commit/02aa56c))

# [1.6.0](https://github.com/NaturalCycles/backend-lib/compare/v1.5.1...v1.6.0) (2019-03-30)


### Features

* make SentrySharedService lazy loaded ([635e3ba](https://github.com/NaturalCycles/backend-lib/commit/635e3ba))

## [1.5.1](https://github.com/NaturalCycles/backend-lib/compare/v1.5.0...v1.5.1) (2019-03-20)


### Bug Fixes

* **sentry:** pass options correctly ([e2f30cc](https://github.com/NaturalCycles/backend-lib/commit/e2f30cc))
* tsc ([8904205](https://github.com/NaturalCycles/backend-lib/commit/8904205))

# [1.5.0](https://github.com/NaturalCycles/backend-lib/compare/v1.4.0...v1.5.0) (2019-03-15)


### Features

* removed custom errors in favour of HttpError ([c5eddc9](https://github.com/NaturalCycles/backend-lib/commit/c5eddc9))

# [1.4.0](https://github.com/NaturalCycles/backend-lib/compare/v1.3.0...v1.4.0) (2019-03-15)


### Features

* SentrySharedService.captureMessage with level ([0d79f54](https://github.com/NaturalCycles/backend-lib/commit/0d79f54))

# [1.3.0](https://github.com/NaturalCycles/backend-lib/compare/v1.2.4...v1.3.0) (2019-03-15)


### Features

* upgrade deps ([20b6c89](https://github.com/NaturalCycles/backend-lib/commit/20b6c89))

## [1.2.4](https://github.com/NaturalCycles/backend-lib/compare/v1.2.3...v1.2.4) (2019-03-09)


### Bug Fixes

* upgrade js-lib, nodejs-lib ([93c175d](https://github.com/NaturalCycles/backend-lib/commit/93c175d))

## [1.2.3](https://github.com/NaturalCycles/backend-lib/compare/v1.2.2...v1.2.3) (2019-02-22)


### Bug Fixes

* err instanceof Error400 ([540bded](https://github.com/NaturalCycles/backend-lib/commit/540bded))

## [1.2.2](https://github.com/NaturalCycles/backend-lib/compare/v1.2.1...v1.2.2) (2019-02-22)


### Bug Fixes

* error.name for custom http errors ([a30eeab](https://github.com/NaturalCycles/backend-lib/commit/a30eeab))

## [1.2.1](https://github.com/NaturalCycles/backend-lib/compare/v1.2.0...v1.2.1) (2019-02-22)


### Bug Fixes

* export sentryErrorMiddleware ([7f54f94](https://github.com/NaturalCycles/backend-lib/commit/7f54f94))

# [1.2.0](https://github.com/NaturalCycles/backend-lib/compare/v1.1.2...v1.2.0) (2019-02-22)


### Features

* sentrySharedService.setUserId(), init() ([b25ef27](https://github.com/NaturalCycles/backend-lib/commit/b25ef27))

## [1.1.2](https://github.com/NaturalCycles/backend-lib/compare/v1.1.1...v1.1.2) (2019-02-16)


### Bug Fixes

* don't export resourceTestService ([ada8267](https://github.com/NaturalCycles/backend-lib/commit/ada8267))

## [1.1.1](https://github.com/NaturalCycles/backend-lib/compare/v1.1.0...v1.1.1) (2019-02-16)


### Bug Fixes

* tuning services to support constructor DI ([7cb899d](https://github.com/NaturalCycles/backend-lib/commit/7cb899d))

# [1.1.0](https://github.com/NaturalCycles/backend-lib/compare/v1.0.0...v1.1.0) (2019-02-10)


### Features

* progress ([da0637c](https://github.com/NaturalCycles/backend-lib/commit/da0637c))

# 1.0.0 (2019-02-09)


### Bug Fixes

* ci ([ff05617](https://github.com/NaturalCycles/backend-lib/commit/ff05617))


### Features

* init ([23d201e](https://github.com/NaturalCycles/backend-lib/commit/23d201e))
