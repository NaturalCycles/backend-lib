import { Router } from 'express'
import PromiseRouter from 'express-promise-router'

/**
 * Convenience method.
 */
export function getDefaultRouter (): Router {
  return PromiseRouter()
}
