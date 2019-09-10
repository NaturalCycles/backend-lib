/*

DEBUG=app*,nc:* yarn tsn-script ./src/test/server/server.ts

 */

/* tslint:disable:ordered-imports */

const bootstrapStartedAt = Date.now()
import { log } from '../../log'
log('startServer... ')

import {
  startServer,
  createDefaultApp,
  getDefaultRouter,
  statusHandler,
  okHandler,
} from '../../index'
import { loginHtml } from '../../admin/admin.mw'
import { adminService, firebaseService, reqAdmin } from './admin'

const router = getDefaultRouter()
export const rootResource = router

router.get('/', okHandler())
router.get('/status', statusHandler())
router.get('/login.html', loginHtml(firebaseService.cfg))

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
    resources: [rootResource],
  }),
  bootstrapStartedAt,
})
