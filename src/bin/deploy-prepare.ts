#!/usr/bin/env node

/*

yarn deploy-prepare

 */

import 'loud-rejection/register'
import { deployPrepareCommand } from '../gae/deploy.util'

void deployPrepareCommand()

// deploy strategy
// gae project: from config
// gae service: from config -- branch name
// gae version: automatic form date

// yarn build-prod
// yarn deploy-prepare && ./tmp/deploy/app.yaml && ./tmp/deploy/deployInfo.json && json2env
//
