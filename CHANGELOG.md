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
