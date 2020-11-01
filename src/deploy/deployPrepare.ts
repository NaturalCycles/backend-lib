import * as fsLibType from '@naturalcycles/fs-lib'
import { dimGrey } from '@naturalcycles/nodejs-lib/dist/colors'
import * as fs from 'fs-extra'
import { srcDir } from '../paths.cnst'
import { getBackendCfg } from './backend.cfg.util'
import { DeployInfo } from './deploy.model'
import { createAndSaveAppYaml, createAndSaveDeployInfo } from './deploy.util'

export interface DeployPrepareOptions {
  projectDir?: string
  targetDir?: string
  createNpmrc?: boolean

  /**
   * Comma-separated list of env variables that will be passed to app.yaml from process.env.
   * Use it to pass secrets.
   */
  appYamlPassEnv?: string
}

export const deployPrepareYargsOptions = {
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
    desc: 'Create .npmrc in targetDir if NPM_TOKEN env var is set',
    default: true,
  },
  appYamlPassEnv: {
    type: 'string',
    desc: 'Comma-separated list of env variables that will be passed to app.yaml from process.env',
  },
} as const

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

export async function deployPrepare(opt: DeployPrepareOptions = {}): Promise<DeployInfo> {
  // lazy load (somehow fixes `yarn test-leaks`)
  const { kpySync } = require('@naturalcycles/fs-lib') as typeof fsLibType
  const { projectDir = '.', targetDir = './tmp/deploy', createNpmrc = true } = opt

  const backendCfg = getBackendCfg(projectDir)
  const inputPatterns = backendCfg.files || DEFAULT_FILES
  const appYamlPassEnv = opt.appYamlPassEnv || backendCfg.appYamlPassEnv

  console.log(`1. Copy files to ${dimGrey(targetDir)}`)

  // Clean targetDir
  fs.emptyDirSync(targetDir)

  kpySync({
    baseDir: defaultFilesDir,
    outputDir: targetDir,
    dotfiles: true,
  })

  kpySync({
    baseDir: projectDir,
    inputPatterns,
    outputDir: targetDir,
    dotfiles: true,
  })

  const { NPM_TOKEN } = process.env
  if (NPM_TOKEN && createNpmrc) {
    const npmrcPath = `${targetDir}/.npmrc`
    const npmrc = `//registry.npmjs.org/:_authToken=${NPM_TOKEN}`
    fs.writeFileSync(npmrcPath, npmrc)
  }

  console.log(`2. Generate ${dimGrey('deployInfo.json')} and ${dimGrey('app.yaml')} in targetDir`)

  const deployInfo = await createAndSaveDeployInfo(backendCfg, targetDir)
  createAndSaveAppYaml(backendCfg, deployInfo, projectDir, targetDir, appYamlPassEnv)

  return deployInfo
}
