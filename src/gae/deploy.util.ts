import { kpy } from '@naturalcycles/fs-lib'
import { _merge, StringMap } from '@naturalcycles/js-lib'
import { dayjs } from '@naturalcycles/time-lib'
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
    TZ: 'UTC',
    // NODE_ICU_DATA: './node_modules/full-icu',
    TS_NODE_PROJECT: './tsconfig.dist.json',
  },
})

interface DeployPrepareCommandOptions {
  projectDir?: string
  targetDir?: string
  createNpmrc?: boolean
}

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
  }).argv

  return deployPrepare(opts)
}

export async function deployPrepare (opts: DeployPrepareCommandOptions = {}): Promise<DeployInfo> {
  const { projectDir = '.', targetDir = './tmp/deploy', createNpmrc = true } = opts

  const backendCfg = await getBackendCfg(projectDir)
  const inputPatterns = backendCfg.files || DEFAULT_FILES

  console.log(`[deploy-prepare] 1. Copy files to ${targetDir}`)

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

  console.log(`[deploy-prepare] 2. Generate deployInfo.json and app.yaml in targetDir`)

  const deployInfo = await createAndSaveDeployInfo(backendCfg, targetDir)
  await createAndSaveAppYaml(backendCfg, deployInfo, projectDir, targetDir)

  return deployInfo
}

export async function createAndSaveDeployInfo (
  backendCfg: BackendCfg,
  targetDir: string,
): Promise<DeployInfo> {
  const deployInfo = await createDeployInfo(backendCfg)

  const deployInfoPath = `${targetDir}/deployInfo.json`

  await fs.writeJson(deployInfoPath, deployInfo, { spaces: 2 })
  console.log(`saved ${deployInfoPath}`)

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
    gaeService = validateGAEServiceName([gaeService, gitBranch].join('--'))
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
  }
}

export async function createAndSaveAppYaml (
  backendCfg: BackendCfg,
  deployInfo: DeployInfo,
  projectDir: string,
  targetDir: string,
): Promise<AppYaml> {
  const appYaml = await createAppYaml(backendCfg, deployInfo, projectDir)

  const appYamlPath = `${targetDir}/app.yaml`

  await fs.writeFile(appYamlPath, yaml.safeDump(appYaml))
  console.log(`saved ${appYamlPath}`)

  return appYaml
}

export async function createAppYaml (
  backendCfg: BackendCfg,
  deployInfo: DeployInfo,
  projectDir: string,
): Promise<AppYaml> {
  const { appEnvDefault, appEnvByBranch = {} } = backendCfg
  const { gaeService: service, gitBranch } = deployInfo

  const { APP_ENV: processAppEnv } = process.env
  const APP_ENV = processAppEnv || appEnvByBranch[gitBranch] || appEnvDefault
  if (processAppEnv) {
    console.log(`using APP_ENV=${processAppEnv} from process.env`)
  }

  // Check existing app.yaml
  const appYamlPath = `${projectDir}/app.yaml`
  let existingAppYaml = {}
  if (fs.existsSync(appYamlPath)) {
    console.log(`merging-in ${appYamlPath}`)

    existingAppYaml = yaml.safeLoad(await fs.readFile(appYamlPath, 'utf8'))
  }

  return _merge(APP_YAML_DEFAULT(), existingAppYaml, {
    service,
    env_variables: {
      APP_ENV,
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
