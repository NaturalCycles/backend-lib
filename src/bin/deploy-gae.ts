#!/usr/bin/env node

import { runScript } from '@naturalcycles/nodejs-lib'
import yargs from 'yargs'
import { deployGae } from '../deploy/deployGae'
import { deployHealthCheckYargsOptions } from '../deploy/deployHealthCheck'
import { deployPrepareYargsOptions } from '../deploy/deployPrepare'

runScript(async () => {
  const opt = yargs.options({
    ...deployPrepareYargsOptions,
    ...deployHealthCheckYargsOptions,
  }).argv

  await deployGae(opt)
})
