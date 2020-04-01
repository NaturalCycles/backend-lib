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

const db = new HttpDB({
  prefixUrl: 'to_be_defined',
})

const app = expressTestService.createApp([httpDBRequestHandler(inMemoryDB)])
beforeAll(async () => {
  await app.connect()

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

describe('runCommonDBTest', () => runCommonDBTest(db, features))

describe('runCommonDaoTest', () => runCommonDaoTest(db, features))
