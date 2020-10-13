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

const app = expressTestService.createApp([httpDBRequestHandler(inMemoryDB)])

const db = new HttpDB({
  prefixUrl: app.defaults.options.prefixUrl as string,
})

afterAll(async () => {
  await app.close()
})

const features: CommonDBImplementationFeatures = {
  streaming: false,
  createTable: false,
  bufferSupport: false,
}

describe('runCommonDBTest', () => runCommonDBTest(db, features))

describe('runCommonDaoTest', () => runCommonDaoTest(db, features))
