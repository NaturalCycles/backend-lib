import { pDelay } from '@naturalcycles/js-lib'
import { getDefaultRouter } from '../server/getDefaultRouter'
import { expressTestService } from '../testing'

const res = getDefaultRouter()
res.get('/', async (req, res) => {
  await pDelay(10_000)
  res.json('ok')
})

const app = expressTestService.createAppFromResource(res, {
  debug: true,
})
afterAll(async () => {
  await app.close()
})

test('got timeout', async () => {
  // 10 retries by 2 seconds
  // So, we'll see how Got works, between 2 options:
  // A. It does 10 * 1 second (20 seconds)
  // B. It does 1 second max
  await app
    .get('', {
      timeout: 500,
      retry: {
        limit: 10,
        calculateDelay: ({ attemptCount }) => (attemptCount === 10 ? 0 : 500),
      },
    })
    .json()

  // Result: A
}, 60_000)
