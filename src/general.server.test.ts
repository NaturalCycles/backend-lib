import {
  _assert,
  _isHttpErrorResponse,
  _range,
  HttpError,
  pExpectedError,
} from '@naturalcycles/js-lib'
import { arraySchema, deflateString, objectSchema, RequestError } from '@naturalcycles/nodejs-lib'
import { safeJsonMiddleware } from './server/safeJsonMiddleware'
import { expressTestService } from './testing'
import { getDefaultRouter, reqValidation } from './index'

const router = getDefaultRouter()
router.get('/circular', safeJsonMiddleware(), async req => {
  // console.log(inspectAny(req))

  throw new HttpError('the error', {
    httpStatusCode: 500,
    req,
  })
})

router.post(
  '/compressedBody',
  reqValidation(
    'body',
    objectSchema({
      items: arraySchema(),
    }),
  ),
  async (req, res) => {
    res.json(req.body)
  },
)

const app = expressTestService.createAppFromResource(router)
afterAll(async () => {
  await app.close()
})

test('should not crash on circular objects in errors', async () => {
  const err = await pExpectedError(app.get('circular'))
  // console.log(err)
  expect(err).toBeInstanceOf(RequestError)
  _assert(err instanceof RequestError) // for typescript
  // console.log(err.response.body)
  _assert(_isHttpErrorResponse(err.response?.body))
  // const cause = err.response.body.error
  // console.log((cause.data as any).req)
})

test('should support compressed body', async () => {
  // "large" input with 10k objects
  const input = {
    items: _range(1, 10_001).map(id => ({ id })),
  }

  const body = await deflateString(JSON.stringify(input))
  console.log(body.byteLength)

  const output = await app
    .post('compressedBody', {
      headers: {
        'content-type': 'application/json',
        'content-encoding': 'deflate',
      },
      body,
    })
    .json()

  // console.log(output)
  expect(output).toEqual(input)
})
