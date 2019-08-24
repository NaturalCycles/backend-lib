#!/usr/bin/env node

/*

yarn deploy-prepare

 */

import { runScript } from '@naturalcycles/nodejs-lib'
import 'loud-rejection/register'
import { deployPrepareCommand } from '../gae/deploy.util'

runScript(deployPrepareCommand)

// deploy strategy
// gae project: from config
// gae service: from config -- branch name
// gae version: automatic form date

// yarn build-prod
// yarn deploy-prepare && ./tmp/deploy/app.yaml && ./tmp/deploy/deployInfo.json && json2env
//
