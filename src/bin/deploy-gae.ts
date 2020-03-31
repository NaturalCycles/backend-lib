#!/usr/bin/env node

import { runScript } from '@naturalcycles/nodejs-lib'
import 'loud-rejection/register'
import { deployGaeCommand } from '../deploy/deployGae.command'

runScript(deployGaeCommand)
