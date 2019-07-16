#!/usr/bin/env node

import 'loud-rejection/register'
import { deployGaeCommand } from '../gae/deployGae.command'

void deployGaeCommand()
