#!/usr/bin/env node

import { runScript } from '@naturalcycles/nodejs-lib'
import { undeployGae } from '../deploy/deployGae'

runScript(async () => {
  await undeployGae()
})
