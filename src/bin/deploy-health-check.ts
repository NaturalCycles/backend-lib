#!/usr/bin/env node

/*

yarn deploy-health-check --url https://service-dot-yourproject.appspot.com

--repeat 3
--timeoutSec 30
--intervalSec 2

 */

import { runScript } from '@naturalcycles/nodejs-lib'
import 'loud-rejection/register'
import { deployHealthCheckCommand } from '../deploy/deployHealthCheck.command'

runScript(deployHealthCheckCommand)
