import { _since } from '@naturalcycles/js-lib'

export default async (): Promise<void> => {
  const started = Date.now()
  // @ts-expect-error
  await new Promise(resolve => global['__EXPRESS_SERVER__'].close(resolve as any))
  console.log(`\nglobalTeardown.ts done in ${_since(started)}`)
}
