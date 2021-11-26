import PromiseRouter from 'express-promise-router'
import { BackendRequestHandler, BackendRouter } from './server.model'

/**
 * Convenience method.
 */
export function getDefaultRouter(defaultHandlers: BackendRequestHandler[] = []): BackendRouter {
  const router = PromiseRouter()

  // Use default handlers
  defaultHandlers.forEach(h => router.use(h))

  return router
}
