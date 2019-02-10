import { getDefaultRouter } from '..'

const router = getDefaultRouter()
export const debugResource = router

router.get('/asyncError', async () => {
  throw new Error('debug_async_error')
})
