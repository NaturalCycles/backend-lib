import { InMemoryDB } from '@naturalcycles/db-lib'
import {
  CommonDBImplementationFeatures,
  runCommonDaoTest,
  runCommonDBTest,
} from '@naturalcycles/db-lib/dist/testing'
import { createTestItemsDBM, TEST_TABLE } from '@naturalcycles/db-lib/dist/testing'
import { HTTPError } from 'got'
import { CloseableGot, expressTestService } from '../testing'
import { HttpDB } from './httpDB'
import { httpDBRequestHandler } from './httpDBRequestHandler'

const inMemoryDB = new InMemoryDB()

const db = new HttpDB({
  prefixUrl: 'to_be_defined',
})

let app: CloseableGot
beforeAll(async () => {
  app = await expressTestService.getGot([httpDBRequestHandler(inMemoryDB)])

  db.setCfg({
    prefixUrl: app.defaults.options.prefixUrl as string,
    maxResponseLength: 10000,
  })
})
afterAll(async () => {
  await app.close()
})

const features: CommonDBImplementationFeatures = {
  streaming: false,
  createTable: false,
}

test.skip('warmup', async () => {
  const items = createTestItemsDBM(3)
  await db.saveBatch(TEST_TABLE, items).catch((err: HTTPError) => {
    // todo: print more proper errors!
    console.log(err)
  })
})

describe('runCommonDBTest', () => runCommonDBTest(db, features))

describe('runCommonDaoTest', () => runCommonDaoTest(db, features))
