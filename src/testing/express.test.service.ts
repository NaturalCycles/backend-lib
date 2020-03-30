import { getGot, GetGotOptions } from '@naturalcycles/nodejs-lib'
import { Got } from 'got'

class ExpressTestService {
  getGot(opt: GetGotOptions = {}): Got {
    return getGot(opt).extend({
      prefixUrl: process.env.__EXPRESS_SERVER_URL__,
    })
  }
}

export const expressTestService = new ExpressTestService()
