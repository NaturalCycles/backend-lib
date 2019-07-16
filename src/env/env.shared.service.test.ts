import { envDir } from '../test/paths.cnst'
import { EnvSharedService, EnvSharedServiceCfg } from './env.shared.service'

const cfg: EnvSharedServiceCfg = {
  envDir,
}

test('envService', () => {
  const envService = new EnvSharedService(cfg)

  // test.env.ts not found
  expect(() => envService.getEnv()).toThrow('Cannot read envFile')

  // test1
  process.env.APP_ENV = 'test1'
  let env = envService.getEnv()
  expect(env).toEqual({
    name: 'test1',
    a: 'a1',
  })

  // test2, env cached
  process.env.APP_ENV = 'test2'
  env = envService.getEnv()
  expect(env).toEqual({
    name: 'test1',
    a: 'a1',
  })

  // test2, env reset
  envService.setEnv()
  env = envService.getEnv()
  expect(env).toEqual({
    name: 'test2',
    a: 'a2',
  })
})
