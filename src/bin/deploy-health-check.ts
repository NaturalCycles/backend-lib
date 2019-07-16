#!/usr/bin/env node

/*

yarn deploy-health-check --url https://service-dot-yourproject.appspot.com

--repeat 3
--timeoutSec 30
--intervalSec 2

 */

import { _range } from '@naturalcycles/js-lib'
import { pDelay } from '@naturalcycles/promise-lib'
import { since } from '@naturalcycles/time-lib'
import * as got from 'got'
import 'loud-rejection/register'
import * as yargs from 'yargs'

void main()

async function main () {
  const { url, repeat, timeoutSec, intervalSec } = yargs.options({
    url: {
      type: 'string',
      demandOption: true,
    },
    repeat: {
      type: 'number',
      default: 3,
    },
    timeoutSec: {
      type: 'number',
      default: 30,
    },
    intervalSec: {
      type: 'number',
      default: 2,
    },
  }).argv

  for await (const attempt of _range(1, repeat + 1)) {
    console.log(`>> ${url} (attempt ${attempt} / ${repeat})`)
    const started = Date.now()

    const { statusCode } = await got(url, {
      json: true,
      timeout: timeoutSec * 1000,
      retry: 0, // no retries allowed
      followRedirect: false,
      throwHttpErrors: false,
    })

    console.log(`<< HTTP ${statusCode} in ${since(started)}`)

    if (statusCode !== 200) {
      console.log(`Health check failed!`)
      process.exit(1)
    }

    await pDelay(intervalSec * 1000)
  }
}
