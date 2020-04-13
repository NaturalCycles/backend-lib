import { since } from '@naturalcycles/js-lib'

export default async () => {
  const started = Date.now()
  await new Promise(resolve => global.__EXPRESS_SERVER__.close(resolve as any))
  console.log(`\nglobalTeardown.ts done in ${since(started)}`)
}
