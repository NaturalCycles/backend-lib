import { debugResource } from '../test/debug.resource'
import { expressTestService } from '../testing'
import { GenericErrorMiddlewareCfg } from './genericErrorMiddleware'

const app = expressTestService.createAppFromResource(debugResource)

afterAll(async () => {
  await app.close()
})

test('genericErrorFormatter', async () => {
  let res = (await app
    .get('asyncError', {
      throwHttpErrors: false,
    })
    .json()) as any

  expect(res.error.data.dirtySecret).toEqual('51')

  const overriddenSecret = 'Nothing to see'
  const mwCfg: GenericErrorMiddlewareCfg = {
    formatError: err => {
      err.data.dirtySecret = overriddenSecret
    },
  }

  const appWExtraMw = expressTestService.createAppFromResource(debugResource, undefined, mwCfg)
  res = (await appWExtraMw
    .get('asyncError', {
      throwHttpErrors: false,
    })
    .json()) as any

  expect(res.error.data.dirtySecret).toEqual(overriddenSecret)
})
