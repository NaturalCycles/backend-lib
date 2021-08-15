import * as http from 'http'
import { createDefaultApp, getDefaultRouter } from '../../src'

export async function createServerBackendLib(): Promise<http.Server> {
  const router = getDefaultRouter()
  const helloResource = router
  router.get('/', (req, res) => res.json({ hello: 'world' }))

  const app = createDefaultApp({
    resources: [helloResource],
  })

  return http.createServer(app)
}
