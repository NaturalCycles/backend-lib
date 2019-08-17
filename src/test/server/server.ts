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
router.get('/hello', (req, res) => res.json({ ok: 1 }))
router.get('/login.html', loginHtml(adminService))

router.get('/debug', reqAdmin(), async (req, res) => {
  res.json({
    adminInfo: await adminService.getAdminInfo(req),
    env: process.env,
    headers: req.headers,
  })
})

router.get('/timeout', () => {
  // just hang on
})

router.get('/error500', async (req, res) => {
  await new Promise(r => setTimeout(r, 500))
  throw new Error('my error 5xx')
})

router.get('/error400', async (req, res) => {
  await new Promise(r => setTimeout(r, 500))
  throw new Error('my error 4xx')
})

void startServer({
  expressApp: createDefaultApp({
    resources: {
      '/': rootResource,
    },
  }),
  bootstrapStartedAt,
})