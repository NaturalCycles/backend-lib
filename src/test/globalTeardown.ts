import { _since } from '@naturalcycles/js-lib'

// eslint-disable-next-line import/no-anonymous-default-export, import/no-default-export
export default async (): Promise<void> => {
  const started = Date.now()
  // @ts-expect-error
  await new Promise(resolve => global['__EXPRESS_SERVER__'].close(resolve as any))
  console.log(`\nglobalTeardown.ts done in ${_since(started)}`)
}
