#!/usr/bin/env node

/*

yarn deploy-prepare

 */

import { runScript } from '@naturalcycles/nodejs-lib'
import * as yargs from 'yargs'
import { deployPrepare, deployPrepareYargsOptions } from '../deploy/deployPrepare'

runScript(async () => {
  const opt = yargs.options(deployPrepareYargsOptions).argv

  await deployPrepare(opt)
})

// deploy strategy
// gae project: from config
// gae service: from config -- branch name
// gae version: automatic form date

// yarn build-prod
// yarn deploy-prepare && ./tmp/deploy/app.yaml && ./tmp/deploy/deployInfo.json && json2env
//
