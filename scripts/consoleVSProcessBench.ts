/*

yarn tsn consoleVSProcessBench

 */

/* eslint-disable unused-imports/no-unused-vars */

import { runBenchScript } from '@naturalcycles/bench-lib'
import { _range } from '@naturalcycles/js-lib'
import { _inspect } from '@naturalcycles/nodejs-lib'

const data = _range(10).map(n => _inspect({ a: 'b', n }))

runBenchScript({
  fns: {
    consoleLog: done => {
      const out = data.map(s => console.log(s))
      done.resolve()
    },
    processWrite: done => {
      const out = data.map(s => process.stdout.write(s + '\n'))
      done.resolve()
    },
  },
  runs: 2,
})
