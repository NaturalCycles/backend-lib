import * as http from 'http'
import { createDefaultApp, getDefaultRouter } from '../../..'

export async function createServer(): Promise<http.Server> {
  const router = getDefaultRouter()
  const helloResource = router
  router.get('/', (req, res) => res.json({ hello: 'world' }))

  const app = createDefaultApp({
    resources: [helloResource],
  })

  return http.createServer(app)
}
