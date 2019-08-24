/*

yarn tsn-script ./src/test/bench/benchAll.ts

 */

import { _range, pDefer, pDelay } from '@naturalcycles/js-lib'
import c from 'chalk'
import * as fs from 'fs-extra'
import * as http from 'http'
import { AddressInfo } from 'net'
import * as yargs from 'yargs'
import { AutocannonSummary } from './bench.model'
const autocannon = require('autocannon')
const profileDir = `${__dirname}/profile`
const summaryJsonPath = `${__dirname}/summary.json`

// const log = Debug('nc:bench')
// Debug.enable('nc:bench')

interface Profile {
  createServer (): Promise<http.Server>
}

interface BenchCfg {
  runs: number
  connections: number
  pipelining: number
  duration: number
  cooldown: number
  host: string
  verbose?: boolean
}

interface AutocannonResult {
  requests: {
    average: number
    [k: string]: number
  }
  latency: {
    average: number
    p50: number
    p90: number
    p99: number
    [k: string]: number
  }
  throughput: {
    average: number
    p50: number
    p90: number
    p99: number
    [k: string]: number
  }
  errors: number
  timeouts: number
}

const profiles = [
  '01-bare-node',
  '02-bare-express',
  '03-express-middlewares',
  '04-backend-lib-default',
]

void main()

async function main () {
  const { runs, connections, pipelining, duration, cooldown, host, verbose } = yargs.options({
    runs: {
      type: 'number',
      default: 2,
    },
    connections: {
      type: 'number',
      default: 100,
    },
    pipelining: {
      type: 'number',
      default: 10,
    },
    duration: {
      type: 'number',
      default: 40,
    },
    cooldown: {
      type: 'number',
      default: 3,
    },
    host: {
      type: 'string',
      default: 'http://localhost',
    },
    verbose: {
      type: 'boolean',
      default: true,
    },
  }).argv
  const cfg: BenchCfg = { runs, connections, pipelining, duration, cooldown, host, verbose }

  console.log(cfg)

  const resultByProfile: Record<string, AutocannonResult> = {}
  const summary: AutocannonSummary[] = []

  for await (const profile of profiles) {
    resultByProfile[profile] = await runProfile(profile, cfg)
    summary.push(toSummary(profile, resultByProfile[profile]))
  }

  console.table(summary)

  await fs.writeJson(summaryJsonPath, summary, { spaces: 2 })
  console.log(`saved ${summaryJsonPath}`)
}

async function runProfile (profileName: string, cfg: BenchCfg): Promise<AutocannonResult> {
  const { connections, pipelining, duration, cooldown, runs, host, verbose } = cfg
  const { createServer } = require(`${profileDir}/${profileName}`) as Profile
  const server = await createServer()
  await new Promise(resolve => server.listen(0, resolve))
  const { port } = server.address() as AddressInfo
  const url = `${host}:${port}`
  // log(`started ${profileName} on port ${port}`)

  let finalResult: AutocannonResult = undefined as any

  for await (const run of _range(1, runs + 1)) {
    console.log(`\n${c.bold.red('=== ' + profileName + ' ===')} run ${run}/${runs}\n`)

    const doneDefer = pDefer<AutocannonResult>()

    const instance = autocannon(
      {
        url,
        connections,
        pipelining,
        duration,
      },
      (err: any, result: AutocannonResult) => {
        if (err) return doneDefer.reject(err)
        doneDefer.resolve(result)
      },
    )

    process.once('SIGINT', () => {
      if (instance) instance.stop()
    })

    autocannon.track(instance, {
      renderProgressBar: true,
      renderResultsTable: verbose,
      renderLatencyTable: verbose,
    })

    finalResult = await doneDefer.promise

    console.log(`cooldown ${cooldown} seconds...`)
    await pDelay(cooldown * 1000)
  }

  await new Promise(resolve => server.close(resolve))

  return finalResult
}

function toSummary (profile: string, result: AutocannonResult): AutocannonSummary {
  return {
    profile,
    rpsAvg: result.requests.average,
    latencyAvg: result.latency.average,
    latency50: result.latency.p50,
    latency90: result.latency.p90,
    latency99: result.latency.p99,
    throughputAvg: Number((result.throughput.average / 1024 / 1024).toFixed(2)),
    errors: result.errors,
    timeouts: result.timeouts,
  }
}
