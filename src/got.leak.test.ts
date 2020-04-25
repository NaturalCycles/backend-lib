import { getGot } from '@naturalcycles/nodejs-lib'

test('got shouldnt leak', async () => {
  const got = getGot({
    logStart: true,
    logFinished: true,
    logResponse: true,
  })
  const _ = await got.get('https://untitled-q7bwfrqzbj21.runkit.sh/')
})
