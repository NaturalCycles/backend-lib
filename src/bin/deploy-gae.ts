#!/usr/bin/env node

import { _yargs, runScript } from '@naturalcycles/nodejs-lib'
import { deployGae } from '../deploy/deployGae'
import { deployHealthCheckYargsOptions } from '../deploy/deployHealthCheck'
import { deployPrepareYargsOptions } from '../deploy/deployPrepare'

runScript(async () => {
  const opt = _yargs().options({
    ...deployPrepareYargsOptions,
    ...deployHealthCheckYargsOptions,
  }).argv

  await deployGae(opt)
})
