import { BackendErrorResponseObject } from '@naturalcycles/js-lib'
import { debugResource } from '../test/debug.resource'
import { expressTestService } from '../testing'

const app = expressTestService.createAppFromResource(debugResource)

afterAll(async () => {
  await app.close()
})

test('genericErrorFormatter', async () => {
  let res = await app.get<BackendErrorResponseObject>('asyncError', {
    throwHttpErrors: false,
  })

  expect(res.error.data['dirtySecret']).toBe('51')

  const overriddenSecret = 'Nothing to see'

  const appWExtraMw = expressTestService.createAppFromResource(debugResource, undefined, {
    genericErrorMwCfg: {
      formatError: err => {
        err.data['dirtySecret'] = overriddenSecret
      },
    },
  })
  res = await appWExtraMw.get<BackendErrorResponseObject>('asyncError', {
    throwHttpErrors: false,
  })

  expect(res.error.data['dirtySecret']).toEqual(overriddenSecret)
  await appWExtraMw.close()
})
