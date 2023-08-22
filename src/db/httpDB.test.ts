import { InMemoryDB } from '@naturalcycles/db-lib'
import {
  CommonDBImplementationFeatures,
  runCommonDaoTest,
  runCommonDBTest,
} from '@naturalcycles/db-lib/dist/testing'
import { expressTestService } from '../testing'
import { HttpDB } from './httpDB'
import { httpDBRequestHandler } from './httpDBRequestHandler'

const inMemoryDB = new InMemoryDB()

const app = expressTestService.createAppFromResource(httpDBRequestHandler(inMemoryDB))

const db = new HttpDB({
  baseUrl: app.cfg.baseUrl,
  retry: { count: 0 },
})

afterAll(async () => {
  await app.close()
})

const features: CommonDBImplementationFeatures = {
  streaming: false,
  createTable: false,
  bufferSupport: false,
  update: false,
  insert: false,
  transactions: false,
  updateByQuery: false,
}

describe('runCommonDBTest', () => runCommonDBTest(db, features))

// todo: unskip and figure it out
describe.skip('runCommonDaoTest', () => runCommonDaoTest(db, features))
