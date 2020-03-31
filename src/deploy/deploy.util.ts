import type * as fsLibType from '@naturalcycles/fs-lib'
import { _mapValues, _merge, _truncate } from '@naturalcycles/js-lib'
import { Debug, dimGrey, white } from '@naturalcycles/nodejs-lib'
import { dayjs } from '@naturalcycles/time-lib'
import * as fs from 'fs-extra'
import * as yaml from 'js-yaml'
import type * as simpleGitLib from 'simple-git/promise'
import * as yargs from 'yargs'
import { srcDir } from '../paths.cnst'
import { BackendCfg, getBackendCfg } from './backend.cfg.util'
import { AppYaml, DeployInfo } from './deploy.model'

const DEFAULT_FILES = [
  'dist',
  'src', // For Sentry
  '!src/test',
  '!src/**/*.test.*',
  '!src/**/*.mock.*',
  '!**/__snapshots__',
  '!**/__exclude',
  'static',
  'secret/**/*.enc', // encrypted secrets
  'package.json',
  'yarn.lock',
  'tsconfig.json', // for path-mapping to work!
  'tsconfig.dist.json',
  '.gcloudignore',
  'app.yaml',
]

const defaultFilesDir = `${srcDir}/deploy/files-default`

const APP_YAML_DEFAULT = (): AppYaml => ({
  runtime: 'nodejs12',
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
    // NODE_ICU_DATA: './node_modules/full-icu',
    TS_NODE_PROJECT: './tsconfig.dist.json',
  },
})

interface DeployPrepareCommandOptions {
  projectDir?: string
  targetDir?: string
  createNpmrc?: boolean

  /**
   * Comma-separated list of env variables that will be passed to app.yaml from process.env.
   * Use it to pass secrets.
   */
  appYamlPassEnv?: string
}

const log = Debug('nc:backend-lib:deploy')

export async function deployPrepareCommand(): Promise<DeployInfo> {
  if (!Debug.enabled('nc:backend-lib')) {
    Debug.enable('nc:backend-lib*')
  }

  const opts = yargs.options({
    projectDir: {
      type: 'string',
      default: '.',
    },
    targetDir: {
      type: 'string',
      default: `./tmp/deploy`,
    },
    createNpmrc: {
      type: 'boolean',
      descr: 'Create .npmrc in targetDir if NPM_TOKEN env var is set',
      default: true,
    },
    appYamlPassEnv: {
      type: 'string',
      descr:
        'Comma-separated list of env variables that will be passed to app.yaml from process.env',
    },
  }).argv

  return await deployPrepare(opts)
}

export async function deployPrepare(opts: DeployPrepareCommandOptions = {}): Promise<DeployInfo> {
  // lazy load (somehow fixes `yarn test-leaks`)
  const { kpy } = require('@naturalcycles/fs-lib') as typeof fsLibType
  const { projectDir = '.', targetDir = './tmp/deploy', createNpmrc = true } = opts

  const backendCfg = await getBackendCfg(projectDir)
  const inputPatterns = backendCfg.files || DEFAULT_FILES
  const appYamlPassEnv = opts.appYamlPassEnv || backendCfg.appYamlPassEnv

  log(`1. Copy files to ${dimGrey(targetDir)}`)

  // Clean targetDir
  await fs.emptyDir(targetDir)

  await kpy({
    baseDir: defaultFilesDir,
    outputDir: targetDir,
    dotfiles: true,
  })

  await kpy({
    baseDir: projectDir,
    inputPatterns,
    outputDir: targetDir,
    dotfiles: true,
  })

  const { NPM_TOKEN } = process.env
  if (NPM_TOKEN && createNpmrc) {
    const npmrcPath = `${targetDir}/.npmrc`
    const npmrc = `//registry.npmjs.org/:_authToken=${NPM_TOKEN}`
    await fs.writeFile(npmrcPath, npmrc)
  }

  log(`2. Generate ${dimGrey('deployInfo.json')} and ${dimGrey('app.yaml')} in targetDir`)

  const deployInfo = await createAndSaveDeployInfo(backendCfg, targetDir)
  await createAndSaveAppYaml(backendCfg, deployInfo, projectDir, targetDir, appYamlPassEnv)

  return deployInfo
}

export async function createAndSaveDeployInfo(
  backendCfg: BackendCfg,
  targetDir: string,
): Promise<DeployInfo> {
  const deployInfo = await createDeployInfo(backendCfg)

  const deployInfoPath = `${targetDir}/deployInfo.json`

  await fs.writeJson(deployInfoPath, deployInfo, { spaces: 2 })
  log(`saved ${dimGrey(deployInfoPath)}`)

  return deployInfo
}

export async function createDeployInfo(backendCfg: BackendCfg): Promise<DeployInfo> {
  const simpleGit = require('simple-git/promise') as typeof simpleGitLib // lazy load
  const git = simpleGit('.')

  const now = dayjs.utc()
  const { current: gitBranch } = await git.status()
  const gitRev = (await git.revparse(['HEAD'])).substr(0, 7)

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
      now.format('YYYYMMDD-HHmm'), // 20190521-1721
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

  log({ deployInfo })

  return deployInfo
}

export async function createAndSaveAppYaml(
  backendCfg: BackendCfg,
  deployInfo: DeployInfo,
  projectDir: string,
  targetDir: string,
  appYamlPassEnv = '',
): Promise<AppYaml> {
  const appYaml = await createAppYaml(backendCfg, deployInfo, projectDir, appYamlPassEnv)

  const appYamlPath = `${targetDir}/app.yaml`

  await fs.writeFile(appYamlPath, yaml.safeDump(appYaml))
  log(`saved ${dimGrey(appYamlPath)}`)

  return appYaml
}

export async function createAppYaml(
  backendCfg: BackendCfg,
  deployInfo: DeployInfo,
  projectDir: string,
  appYamlPassEnv = '',
): Promise<AppYaml> {
  const { appEnvDefault, appEnvByBranch = {} } = backendCfg
  const { gaeService: service, gitBranch } = deployInfo

  const { APP_ENV: processAppEnv } = process.env
  const APP_ENV = processAppEnv || appEnvByBranch[gitBranch] || appEnvDefault
  if (processAppEnv) {
    log(`using APP_ENV=${dimGrey(processAppEnv)} from process.env`)
  }

  const appYaml = APP_YAML_DEFAULT()

  // Check existing app.yaml
  const appYamlPath = `${projectDir}/app.yaml`
  if (fs.existsSync(appYamlPath)) {
    log(`merging-in ${dimGrey(appYamlPath)}`)
    _merge(appYaml, yaml.safeLoad(await fs.readFile(appYamlPath, 'utf8')))
  }

  const appEnvYamlPath = `${projectDir}/app.${APP_ENV}.yaml`
  if (fs.existsSync(appEnvYamlPath)) {
    log(`merging-in ${dimGrey(appEnvYamlPath)}`)
    _merge(appYaml, yaml.safeLoad(await fs.readFile(appEnvYamlPath, 'utf8')))
  }

  // appYamlPassEnv
  require('dotenv').config() // ensure .env is read
  const passEnv = appYamlPassEnv.split(',').reduce((map, key) => {
    const v = process.env[key]
    if (!v) {
      throw new Error(`appYamlPassEnv.${key} is requested, but process.env.${key} is not defined!`)
    }
    map[key] = v
    return map
  }, {} as Record<string, string>)

  if (Object.keys(passEnv).length) {
    log(
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
  log({
    appYaml: redactedAppYaml(appYaml),
  })

  return appYaml
}

function redactedAppYaml(appYaml: AppYaml): AppYaml {
  return {
    ...appYaml,
    env_variables: _mapValues(appYaml.env_variables || {}, v => _truncate(String(v), 7)),
  }
}

export function validateGAEServiceName(serviceName: string): string {
  // May only contain lowercase letters, digits, and hyphens. Must begin and end with a letter or digit. Must not exceed 63 characters.
  return replaceAll(serviceName, '_', '-')
    .toLowerCase()
    .replace(/[^0-9a-z-]/gi, '')
    .substr(0, 40)
}

function replaceAll(str: string, search: string, replacement: string): string {
  return str.split(search).join(replacement)
}
