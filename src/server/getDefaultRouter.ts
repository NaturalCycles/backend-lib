import { RequestHandler, Router } from 'express'
import PromiseRouter from 'express-promise-router'

/**
 * Convenience method.
 */
export function getDefaultRouter(defaultHandlers: RequestHandler[] = []): Router {
  const router = PromiseRouter()

  // Use default handlers
  defaultHandlers.forEach(h => router.use(h))

  return router
}
