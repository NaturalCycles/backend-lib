/*

yarn tsn servers.bench

 */

import { runCannonScript } from '@naturalcycles/bench-lib'
import { createServerBareNode } from './profile/01-bare-node'
import { createServerFastify } from './profile/02-bare-fastify'
import { createServerBareExpress } from './profile/03-bare-express'
import { createServerExpressMiddlewares } from './profile/04-express-middlewares'
import { createServerBackendLib } from './profile/05-backend-lib-default'

runCannonScript(
  {
    '01-bare-node': createServerBareNode,
    '02-bare-fastify': createServerFastify,
    '03-bare-express': createServerBareExpress,
    '04-express-middlewares': createServerExpressMiddlewares,
    '05-backend-lib': createServerBackendLib,
  },
  {
    name: 'Benchmark',
    runs: 2,
    duration: 10,
    cooldown: 1,
    writeRawSummary: false,
    reportDirPath: './scripts/bench',
    beforeText: `Ran with Node.js \`16.13.0\` on MacBook M1 Pro 16" 2021`,
  },
)
