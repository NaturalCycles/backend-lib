/*

yarn tsn ./src/test/bench/plotSummary.ts

 */

import { pMap, StringMap } from '@naturalcycles/js-lib'
import * as fs from 'fs-extra'
import * as vega from 'vega'
import { Spec } from 'vega'
import { TopLevelSpec } from 'vega-lite'
import * as vegaLite from 'vega-lite'
import * as yargs from 'yargs'
import { AutocannonSummary } from './bench.model'
const plotDir = `${__dirname}/plot`

void main()

async function main() {
  const { input } = yargs.options({
    input: {
      type: 'string',
      default: './summary.json',
    },
  }).argv

  const summary = require(input)
  const specs = summaryToVegaSpecs(summary)

  await pMap(Object.keys(specs), async specName => {
    // create a new view instance for a given Vega JSON spec
    const view = new vega.View(vega.parse(specs[specName]!), { renderer: 'none' })

    // generate a static SVG image
    const svg = await view.toSVG()
    // console.log(svg)

    fs.writeFileSync(`${plotDir}/${specName}.svg`, svg)
  })
}

function summaryToVegaSpecs(summary: AutocannonSummary[]): StringMap<Spec> {
  // console.log(summary)
  const fields = ['rpsAvg', 'latencyAvg', 'latency50', 'latency90', 'latency99', 'throughputAvg']

  const specs: Record<string, Spec> = {}

  fields.forEach(field => {
    const liteSpec: TopLevelSpec = {
      // title: 'title',
      // "$schema": "https://vega.github.io/schema/vega-lite/v3.json",
      data: {
        values: summary as any,
      },
      mark: 'bar',
      encoding: {
        y: {
          field: 'profile',
          type: 'ordinal',
          axis: {
            title: '',
          },
        },
        x: {
          field,
          type: 'quantitative',
          axis: {
            title: field,
          },
        },
      },
    }

    const { spec } = vegaLite.compile(liteSpec)
    specs[field] = spec
  })

  return specs
}
