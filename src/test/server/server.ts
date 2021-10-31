/*

DEBUG=app*,nc:* yarn tsn ./src/test/server/server.ts

Benchmark it like this:
autocannon -c 100 -d 40 -p 10 localhost:8080

Or set quicker duration:
autocannon -c 100 -d 40 -p 10 localhost:8080

 */

console.log('startServer... ')

import { pDelay } from '@naturalcycles/js-lib'
import {
  startServer,
  createDefaultApp,
  getDefaultRouter,
  statusHandler,
  okHandler,
} from '../../index'
import { loginHtml } from '../../admin/admin.mw'
import { getRequest, getRequestLogger } from '../../server/handlers/asyncLocalStorage.mw'
import { adminService, firebaseService, reqAdmin } from './admin'

const router = getDefaultRouter()
export const rootResource = router

router.get('/', okHandler())
router.get('/status', statusHandler())
router.get('/login.html', loginHtml(firebaseService.cfg))

router.get('/admin/info', async (req, res) => {
  res.json(await adminService.getAdminInfo(req))
})

router.post('/admin/login', adminService.getFirebaseAuthLoginHandler())

router.get(
  '/debug',
  reqAdmin([], {
    autoLogin: false, // uncomment to debug
  }),
  async (req, res) => {
    req.log('halloa I am log')

    res.json({
      adminInfo: await adminService.getAdminInfo(req),
      env: process.env,
      headers: req.headers,
    })
  },
)

router.get('/timeout', () => {
  // just hang on
})

router.get('/error500', async () => {
  await new Promise(r => setTimeout(r, 500))
  throw new Error('my error 5xx')
})

router.get('/error400', async () => {
  await new Promise(r => setTimeout(r, 500))
  throw new Error('my error 4xx')
})

router.get('/log', async (req, res) => {
  req.log('logging at the start')
  await pDelay(100)
  await someAsyncFunction()
  await pDelay(100)
  req.log('logging at the end')
  res.json({})
})

void startServer({
  expressApp: createDefaultApp({
    resources: [rootResource],
  }),
})

async function someAsyncFunction(): Promise<void> {
  let log = getRequestLogger()
  log('logging from asyncFunction', { a: 'a' }, 42)

  // just to test different way of obtaining the log
  log = getRequest().log
  log.warn('and some warn')
}
