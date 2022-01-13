/*

yarn serve

Benchmark it like this:
autocannon -c 100 -d 40 -p 10 localhost:8080

Or set quicker duration:
autocannon -c 100 -d 40 -p 10 localhost:8080

 */

console.log('startServer... ')

import { pDelay } from '@naturalcycles/js-lib'
import {
  startServer,
  getDefaultRouter,
  serverStatusMiddleware,
  okMiddleware,
  SentrySharedService,
} from '../../index'
import { loginHtml } from '../../admin/adminMiddleware'
import {
  getRequest,
  getRequestLogger,
  requestLogger,
} from '../../server/asyncLocalStorageMiddleware'
import { serverStatsHTMLHandler, serverStatsMiddleware } from '../../server/serverStatsMiddleware'
import { adminService, firebaseService, reqAdmin } from './admin'

const router = getDefaultRouter()
export const rootResource = router

router.get('/', okMiddleware())
router.get('/status', serverStatusMiddleware())
router.get('/stats', serverStatsHTMLHandler)
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

router.get('/log2', async (req, res) => {
  requestLogger.log('yo')
  requestLogger.log('yo2')
  requestLogger.log('yo3')
  res.json({})
})

async function failingFunction() {
  // setTimeout(() => {
  //   throw new Error('failing function error')
  // }, 5000)
  console.log('inside failingFunction')
  await pDelay(0)
  console.log('inside2 failingFunction')
  throw new Error('failing function error')
}

router.get('/testVoid', async (req, res) => {
  req.log('testVoid start')
  await pDelay(50)
  void failingFunction()
  console.log('just after failingFunction')
  // throw new Error('sync error')
  await pDelay(0)
  console.log('just after2 failingFunction')
  res.json({ ok: 1 })
})

const sub = getDefaultRouter()
sub.get('/some/:extra', (req, res) => {
  const { baseUrl, originalUrl, path, method, route, params } = req

  res.json({
    baseUrl,
    originalUrl,
    path,
    method,
    route,
    params,
  })
})

const sentryService = new SentrySharedService({
  autoSessionTracking: false,
})

void startServer({
  handlers: [serverStatsMiddleware()],
  resources: [
    rootResource,
    {
      path: '/sub',
      handler: sub,
    },
  ],
  forceShutdownTimeout: 0,
  sentryService,
})

async function someAsyncFunction(): Promise<void> {
  let logger = getRequestLogger()
  logger.log('logging from asyncFunction', { a: 'a' }, 42)

  // just to test different way of obtaining the log
  logger = getRequest()!
  logger.log('and some warn')
}
