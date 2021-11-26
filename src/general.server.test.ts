import { mockTime } from '@naturalcycles/dev-lib/dist/testing'
import { _assert, _isHttpErrorResponse, HttpError, pTry } from '@naturalcycles/js-lib'
import { HTTPError } from '@naturalcycles/nodejs-lib'
import { safeJsonMiddleware } from './server/safeJsonMiddleware'
import { expressTestService } from './testing'
import { getDefaultRouter } from './index'

beforeEach(() => {
  mockTime()
})

const router = getDefaultRouter()
router.get('/circular', safeJsonMiddleware(), async req => {
  // console.log(inspectAny(req))

  throw new HttpError('the error', {
    httpStatusCode: 500,
    req,
  })
})

const app = expressTestService.createAppFromResource(router)
afterAll(async () => {
  await app.close()
})

test('should not crash on circular objects in errors', async () => {
  const [err] = await pTry(app.get('circular'))
  // console.log(err)
  expect(err).toBeInstanceOf(HTTPError)
  _assert(err instanceof HTTPError) // for typescript
  // console.log(err.response.body)
  _assert(_isHttpErrorResponse(err.response.body))
  // const cause = err.response.body.error
  // console.log((cause.data as any).req)
})
