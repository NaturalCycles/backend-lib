/*

DEBUG=nc:* yarn tsn-script ./src/test/server/server.ts

 */

/* tslint:disable:ordered-imports */

const bootstrapStartedAt = Date.now()
import { log } from '../../log'
log('startServer... ')

import { startServer, createDefaultApp, getDefaultRouter, rootHandler } from '../../index'
import { loginHtml } from '../../admin/admin.mw'
import { adminService, reqAdmin } from './admin'

const router = getDefaultRouter()
export const rootResource = router

router.get('/', rootHandler())
router.get('/login.html', loginHtml(adminService))

router.get('/debug', reqAdmin(), async (req, res) => {
  res.json({
    adminInfo: await adminService.getAdminInfo(req),
    env: process.env,
    headers: req.headers,
  })
})

router.get('/timeout', async (req, res) => {
  // just hang on
})

void startServer({
  expressApp: createDefaultApp({
    resources: {
      '/': rootResource,
    },
  }),
  bootstrapStartedAt,
})
