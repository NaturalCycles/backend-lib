import { kpy } from '@naturalcycles/fs-lib'
import { _merge, StringMap } from '@naturalcycles/js-lib'
import { Debug } from '@naturalcycles/nodejs-lib'
import { dayjs } from '@naturalcycles/time-lib'
import c from 'chalk'
import * as fs from 'fs-extra'
import * as yaml from 'js-yaml'
import * as simpleGit from 'simple-git/promise'
import * as yargs from 'yargs'
import { BackendCfg, getBackendCfg } from '../backend.cfg.util'
import { srcDir } from '../paths.cnst'
const git = simpleGit('.')

export interface DeployInfo {
  gaeProject: string
  gaeService: string
  gaeVersion: string
  versionUrl: string
  serviceUrl: string
  gitRev: string
  gitBranch: string
  prod: boolean

  /**
   * Unix timestamp of deployInfo.json being generated.
   */
  ts: number
}

export interface AppYaml extends StringMap<any> {
  runtime: string
  service: string
  inbound_services?: string[]
  instance_class?: string
  automatic_scaling?: {
    min_instances?: number
    max_instances?: number
  }
  env_variables: {
    APP_ENV: string
    DEBUG: string
    [k: string]: string
  }
}

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

const defaultFilesDir = `${srcDir}/gae/files-default`

const APP_YAML_DEFAULT = (): AppYaml => ({
  runtime: 'nodejs10',
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
Debug.enable('nc:backend-lib*')

export async function deployPrepareCommand (): Promise<DeployInfo> {
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

  return deployPrepare(opts)
}

export async function deployPrepare (opts: DeployPrepareCommandOptions = {}): Promise<DeployInfo> {
  const { projectDir = '.', targetDir = './tmp/deploy', createNpmrc = true } = opts

  const backendCfg = await getBackendCfg(projectDir)
  const inputPatterns = backendCfg.files || DEFAULT_FILES
  const appYamlPassEnv = opts.appYamlPassEnv || backendCfg.appYamlPassEnv

  log(`1. Copy files to ${c.dim(targetDir)}`)

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

  log(`2. Generate ${c.dim('deployInfo.json')} and ${c.dim('app.yaml')} in targetDir`)

  const deployInfo = await createAndSaveDeployInfo(backendCfg, targetDir)
  await createAndSaveAppYaml(backendCfg, deployInfo, projectDir, targetDir, appYamlPassEnv)

  return deployInfo
}

export async function createAndSaveDeployInfo (
  backendCfg: BackendCfg,
  targetDir: string,
): Promise<DeployInfo> {
  const deployInfo = await createDeployInfo(backendCfg)

  const deployInfoPath = `${targetDir}/deployInfo.json`

  await fs.writeJson(deployInfoPath, deployInfo, { spaces: 2 })
  log(`saved ${c.dim(deployInfoPath)}`)

  return deployInfo
}

export async function createDeployInfo (backendCfg: BackendCfg): Promise<DeployInfo> {
  const now = dayjs.utc()
  const { current: gitBranch } = await git.status()
  const gitRev = (await git.revparse(['HEAD'])).substr(0, 7)

  let {
    gaeProject,
    gaeProjectByBranch = {},
    gaeService,
    prodBranch,
    branchesWithTimestampVersions = [],
  } = backendCfg

  gaeProject = gaeProjectByBranch[gitBranch] || gaeProject

  gaeService = validateGAEServiceName(gaeService)

  const prod = gitBranch === prodBranch

  if (!prod) {
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

  return {
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
}

export async function createAndSaveAppYaml (
  backendCfg: BackendCfg,
  deployInfo: DeployInfo,
  projectDir: string,
  targetDir: string,
  appYamlPassEnv = '',
): Promise<AppYaml> {
  const appYaml = await createAppYaml(backendCfg, deployInfo, projectDir, appYamlPassEnv)

  const appYamlPath = `${targetDir}/app.yaml`

  await fs.writeFile(appYamlPath, yaml.safeDump(appYaml))
  log(`saved ${c.dim(appYamlPath)}`)

  return appYaml
}

export async function createAppYaml (
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
    log(`using APP_ENV=${c.dim(processAppEnv)} from process.env`)
  }

  // Check existing app.yaml
  const appYamlPath = `${projectDir}/app.yaml`
  let existingAppYaml = {}
  if (fs.existsSync(appYamlPath)) {
    log(`merging-in ${c.dim(appYamlPath)}`)

    existingAppYaml = yaml.safeLoad(await fs.readFile(appYamlPath, 'utf8'))
  }

  // appYamlPassEnv
  require('dotenv').config() // ensure .env is read
  const passEnv = appYamlPassEnv.split(',').reduce(
    (map, key) => {
      const v = process.env[key]
      if (!v) {
        throw new Error(
          `appYamlPassEnv.${key} is requested, but process.env.${key} is not defined!`,
        )
      }
      map[key] = v
      return map
    },
    {} as Record<string, string>,
  )

  if (Object.keys(passEnv).length) {
    log(
      `will merge ${c.white(
        String(Object.keys(passEnv).length),
      )} process.env keys to app.yaml: ${c.dim(Object.keys(passEnv).join(', '))}`,
    )
  }

  return _merge(APP_YAML_DEFAULT(), existingAppYaml, {
    service,
    env_variables: {
      APP_ENV,
      ...passEnv,
    },
  })
}

export function validateGAEServiceName (serviceName: string): string {
  // May only contain lowercase letters, digits, and hyphens. Must begin and end with a letter or digit. Must not exceed 63 characters.
  return replaceAll(serviceName, '_', '-')
    .toLowerCase()
    .replace(/[^0-9a-z-]/gi, '')
    .substr(0, 40)
}

function replaceAll (str: string, search: string, replacement: string): string {
  return str.split(search).join(replacement)
}
