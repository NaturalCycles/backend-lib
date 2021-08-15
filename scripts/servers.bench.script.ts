/*

yarn tsn servers.bench

 */

import { runCannon } from '@naturalcycles/bench-lib'
import { runScript } from '@naturalcycles/nodejs-lib/dist/script'
import { createServerBareNode } from './profile/01-bare-node'
import { createServerFastify } from './profile/02-bare-fastify'
import { createServerBareExpress } from './profile/03-bare-express'
import { createServerExpressMiddlewares } from './profile/04-express-middlewares'
import { createServerBackendLib } from './profile/05-backend-lib-default'

runScript(async () => {
  await runCannon(
    {
      '01-bare-node': createServerBareNode,
      '02-bare-fastify': createServerFastify,
      '03-bare-express': createServerBareExpress,
      '04-express-middlewares': createServerExpressMiddlewares,
      '05-backend-lib': createServerBackendLib,
    },
    {
      name: 'Benchmark',
      // runs: 2,
      // duration: 10,
      duration: 2,
      cooldown: 1,
      // silent: true,
      reportDirPath: './scripts/bench',
      // renderResultsTable: false,
      renderLatencyTable: false,
    },
  )
})
