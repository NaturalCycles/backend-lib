import { srcDir } from '../paths.cnst'
import { getDeployInfo } from './deployInfo.util'

test('getDeployInfo non-existing file', () => {
  const deployInfo = getDeployInfo('')
  expect(deployInfo).toMatchObject({
    gaeProject: '',
  })

  getDeployInfo('') // should not log again due to memoFn
})

test('getDeployInfo existing file', () => {
  const deployInfo = getDeployInfo(`${srcDir}/test/deploy`)
  expect(deployInfo).toMatchObject({
    gaeProject: 'test-project',
  })
})
