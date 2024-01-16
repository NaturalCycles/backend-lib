import {
  CommonDB,
  CommonDBOptions,
  CommonDBSaveOptions,
  DBQuery,
  InMemoryDB,
} from '@naturalcycles/db-lib'
import {
  commonDBOptionsSchema,
  commonDBSaveOptionsSchema,
  dbQuerySchema,
} from '@naturalcycles/db-lib/dist/validation'
import { ObjectWithId } from '@naturalcycles/js-lib'
import { anyObjectSchema, arraySchema, objectSchema, stringSchema } from '@naturalcycles/nodejs-lib'
import { BackendRouter, getDefaultRouter, reqValidation } from '..'

export interface GetByIdsInput {
  table: string
  ids: string[]
  opt?: CommonDBOptions
}

const getByIdsInputSchema = objectSchema<GetByIdsInput>({
  table: stringSchema,
  ids: arraySchema(stringSchema),
  opt: commonDBOptionsSchema.optional(),
})

export interface RunQueryInput {
  query: Partial<DBQuery<any>> & { table: string }
  opt?: CommonDBOptions
}

const runQueryInputSchema = objectSchema<RunQueryInput>({
  query: dbQuerySchema,
  opt: commonDBOptionsSchema.optional(),
})

export interface SaveBatchInput {
  table: string
  rows: ObjectWithId[]
  opt?: CommonDBSaveOptions
}

const saveBatchInputSchema = objectSchema<SaveBatchInput>({
  table: stringSchema,
  rows: arraySchema(anyObjectSchema),
  opt: commonDBSaveOptionsSchema.optional(),
})

/**
 * Exposes CommonDB interface from provided CommonDB as HTTP endpoint (Express RequestHandler).
 */
export function httpDBRequestHandler(db: CommonDB): BackendRouter {
  const router = getDefaultRouter()

  // resetCache, only applicable to InMemoryDB
  router.put('/resetCache/:table?', async (req, res) => {
    if (db instanceof InMemoryDB) {
      await db.resetCache(req.params['table'])
    }
    res.end()
  })

  // ping
  router.get('/ping', async (req, res) => {
    await db.ping()
    res.end()
  })

  // getTables
  router.get('/tables', async (req, res) => {
    res.json(await db.getTables())
  })

  // getTableSchema
  router.get('/:table/schema', async (req, res) => {
    res.json(await db.getTableSchema(req.params['table']))
  })

  // todo: createTable
  // router.post('/tables/:table', async (req, res) => {
  //
  // })

  // getByIds
  router.put('/getByIds', reqValidation('body', getByIdsInputSchema), async (req, res) => {
    const { table, ids, opt } = req.body as GetByIdsInput
    res.json(await db.getByIds(table, ids, opt))
  })

  // runQuery
  router.put('/runQuery', reqValidation('body', runQueryInputSchema), async (req, res) => {
    const { query, opt } = req.body as RunQueryInput
    const q = DBQuery.fromPlainObject(query)
    res.json(await db.runQuery(q, opt))
  })

  // runQueryCount
  router.put('/runQueryCount', reqValidation('body', runQueryInputSchema), async (req, res) => {
    const { query, opt } = req.body as RunQueryInput
    const q = DBQuery.fromPlainObject(query)
    res.json(await db.runQueryCount(q, opt))
  })

  // saveBatch
  router.put('/saveBatch', reqValidation('body', saveBatchInputSchema), async (req, res) => {
    const { table, rows, opt } = req.body as SaveBatchInput
    await db.saveBatch(table, rows, opt)
    res.end()
  })

  // deleteByIds
  // router.put('/deleteByIds', reqValidation('body', getByIdsInputSchema), async (req, res) => {
  //   const { table, ids, opt } = req.body as GetByIdsInput
  //   res.json(await db.deleteByIds(table, ids, opt))
  // })

  // deleteByQuery
  router.put('/deleteByQuery', reqValidation('body', runQueryInputSchema), async (req, res) => {
    const { query, opt } = req.body as RunQueryInput
    const q = DBQuery.fromPlainObject(query)
    res.json(await db.deleteByQuery(q, opt))
  })

  return router
}
