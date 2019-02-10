import { Router } from 'express'
import * as request from 'supertest'
import { createDefaultApp } from '..'

class ResourceTestService {
  createAppWithResource (resource: Router): request.SuperTest<request.Test> {
    const app = createDefaultApp({
      resources: {
        '/': resource,
      },
    })
    return request(app)
  }
}

export const resourceTestService = new ResourceTestService()
