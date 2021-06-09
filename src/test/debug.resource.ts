import { objectSchema, stringSchema } from '@naturalcycles/nodejs-lib'
import { getDefaultRouter, reqValidation } from '..'

const router = getDefaultRouter()
export const debugResource = router

router.get('/', async (req, res) => {
  res.json({ ok: 1 })
})

interface PwInput {
  pw: string
}

const pwInputSchema = objectSchema<PwInput>({
  pw: stringSchema.min(8),
})

router.put(
  '/changePassword',
  reqValidation('body', pwInputSchema, { redactPath: 'pw' }),
  async (_req, res) => {
    res.json({ ok: 1 })
  },
)

router.get('/asyncError', async () => {
  throw new Error('debug_async_error')
})
