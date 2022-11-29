import * as fs from 'node:fs'
import { _mapValues, _merge, _truncate, localTime } from '@naturalcycles/js-lib'
import { dimGrey, white } from '@naturalcycles/nodejs-lib/dist/colors'
import * as yaml from 'js-yaml'
import { BackendCfg } from './backend.cfg.util'
import { AppYaml, DeployInfo } from './deploy.model'

const APP_YAML_DEFAULT = (): AppYaml => ({
  runtime: 'nodejs16',
  service: 'default',
  inbound_services: ['warmup'],
  instance_class: 'F1',
  automatic_scaling: {
    min_instances: 0,
    max_instances: 1,
  },
  env_variables: {
    APP_ENV: 'prod',
    DEBUG: 'app*,nc:*',
    DEBUG_HIDE_DATE: 'true',
    // DEBUG_COLORS: 'true',
    TZ: 'UTC',
    TS_NODE_PROJECT: './tsconfig.dist.json',
  },
})

export async function createAndSaveDeployInfo(
  backendCfg: BackendCfg,
  targetDir: string,
): Promise<DeployInfo> {
  const deployInfo = await createDeployInfo(backendCfg)

  const deployInfoPath = `${targetDir}/deployInfo.json`

  fs.writeFileSync(deployInfoPath, JSON.stringify(deployInfo, null, 2))
  console.log(`saved ${dimGrey(deployInfoPath)}`)

  return deployInfo
}

export async function createDeployInfo(backendCfg: BackendCfg): Promise<DeployInfo> {
  const simpleGit = require('simple-git') // lazy load
  const git = simpleGit('.')

  const now = localTime()
  const gitBranch = (await git.status()).current!
  const gitRev = (await git.revparse(['HEAD'])).slice(0, 7)

  let {
    gaeProject,
    gaeProjectByBranch = {},
    gaeService,
    gaeServiceByBranch = {},
    serviceWithBranchName,
    prodBranch,
    branchesWithTimestampVersions = [],
  } = backendCfg

  gaeProject = gaeProjectByBranch[gitBranch] || gaeProject

  gaeService = validateGAEServiceName(gaeServiceByBranch[gitBranch] || gaeService)

  const prod = gitBranch === prodBranch

  if (!prod && serviceWithBranchName && !gaeServiceByBranch[gitBranch]) {
    gaeService = validateGAEServiceName([gitBranch, gaeService].join('--'))
  }

  let gaeVersion = '1'

  if (branchesWithTimestampVersions.includes(gitBranch)) {
    // May only contain lowercase letters, digits, and hyphens. Must begin and end with a letter or digit. Must not exceed 63 characters.
    gaeVersion = [
      // now.format('YYYYMMDD-HHmm'), // 20190521-1721
      now.toStringCompact().replace('_', '-'),
      gitRev,
    ].join('-')
  }

  const versionUrl = `https://${[gaeVersion, gaeService, gaeProject].join('-dot-')}.appspot.com`

  const serviceUrl = `https://${[gaeService, gaeProject].join('-dot-')}.appspot.com`

  const deployInfo: DeployInfo = {
    gaeProject,
    gaeService,
    gaeVersion,
    versionUrl,
    serviceUrl,
    gitBranch,
    gitRev,
    prod,
    ts: now.unix(),
  }

  console.log({ deployInfo })

  return deployInfo
}

export function createAndSaveAppYaml(
  backendCfg: BackendCfg,
  deployInfo: DeployInfo,
  projectDir: string,
  targetDir: string,
  appYamlPassEnv = '',
): AppYaml {
  const appYaml = createAppYaml(backendCfg, deployInfo, projectDir, appYamlPassEnv)

  const appYamlPath = `${targetDir}/app.yaml`

  fs.writeFileSync(appYamlPath, yaml.dump(appYaml))
  console.log(`saved ${dimGrey(appYamlPath)}`)

  return appYaml
}

export function createAppYaml(
  backendCfg: BackendCfg,
  deployInfo: DeployInfo,
  projectDir: string,
  appYamlPassEnv = '',
): AppYaml {
  const { appEnvDefault, appEnvByBranch = {} } = backendCfg
  const { gaeService: service, gitBranch } = deployInfo

  const { APP_ENV: processAppEnv } = process.env
  const APP_ENV = processAppEnv || appEnvByBranch[gitBranch] || appEnvDefault
  if (processAppEnv) {
    console.log(`using APP_ENV=${dimGrey(processAppEnv)} from process.env`)
  }

  const appYaml = APP_YAML_DEFAULT()

  // Check existing app.yaml
  const appYamlPath = `${projectDir}/app.yaml`
  if (fs.existsSync(appYamlPath)) {
    console.log(`merging-in ${dimGrey(appYamlPath)}`)
    _merge(appYaml, yaml.load(fs.readFileSync(appYamlPath, 'utf8')))
  }

  const appEnvYamlPath = `${projectDir}/app.${APP_ENV}.yaml`
  if (fs.existsSync(appEnvYamlPath)) {
    console.log(`merging-in ${dimGrey(appEnvYamlPath)}`)
    _merge(appYaml, yaml.load(fs.readFileSync(appEnvYamlPath, 'utf8')))
  }

  // appYamlPassEnv
  require('dotenv').config() // ensure .env is read
  const passEnv = appYamlPassEnv
    .split(',')
    .filter(Boolean)
    // eslint-disable-next-line unicorn/no-array-reduce
    .reduce((map, key) => {
      const v = process.env[key]
      if (!v) {
        throw new Error(
          `appYamlPassEnv.${key} is requested, but process.env.${key} is not defined!`,
        )
      }
      map[key] = v
      return map
    }, {} as Record<string, string>)

  if (Object.keys(passEnv).length) {
    console.log(
      `will merge ${white(
        String(Object.keys(passEnv).length),
      )} process.env keys to app.yaml: ${dimGrey(Object.keys(passEnv).join(', '))}`,
    )
  }

  _merge(appYaml, {
    service,
    env_variables: {
      APP_ENV,
      ...passEnv,
    },
  })

  // Redacted appYaml to not show up secrets
  console.log({
    appYaml: redactedAppYaml(appYaml),
  })

  return appYaml
}

function redactedAppYaml(appYaml: AppYaml): AppYaml {
  return {
    ...appYaml,
    env_variables: _mapValues(appYaml.env_variables || {}, (_k, v) => _truncate(String(v), 7)),
  }
}

export function validateGAEServiceName(serviceName: string): string {
  // May only contain lowercase letters, digits, and hyphens. Must begin and end with a letter or digit. Must not exceed 63 characters.
  return replaceAll(serviceName, '_', '-')
    .toLowerCase()
    .replace(/[^0-9a-z-]/gi, '')
    .slice(0, 40)
}

function replaceAll(str: string, search: string, replacement: string): string {
  return str.split(search).join(replacement)
}
