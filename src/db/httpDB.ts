import { Readable } from 'node:stream'
import {
  BaseCommonDB,
  CommonDB,
  CommonDBOptions,
  CommonDBSaveOptions,
  CommonDBStreamOptions,
  DBQuery,
  RunQueryResult,
} from '@naturalcycles/db-lib'
import {
  Fetcher,
  FetcherOptions,
  getFetcher,
  JsonSchemaRootObject,
  ObjectWithId,
} from '@naturalcycles/js-lib'
import { ReadableTyped } from '@naturalcycles/nodejs-lib'

export interface HttpDBCfg extends FetcherOptions {
  baseUrl: string
}

/**
 * Implementation of CommonDB that proxies all requests via HTTP to "httpDBRequestHandler".
 */
export class HttpDB extends BaseCommonDB implements CommonDB {
  constructor(public cfg: HttpDBCfg) {
    super()
    this.setCfg(cfg)
  }

  setCfg(cfg: HttpDBCfg): void {
    this.fetcher = getFetcher(cfg)
  }

  private fetcher!: Fetcher

  override async ping(): Promise<void> {
    await this.fetcher.getVoid(`ping`)
  }

  override async getTables(): Promise<string[]> {
    return await this.fetcher.get(`tables`)
  }

  override async getTableSchema<ROW extends ObjectWithId>(
    table: string,
  ): Promise<JsonSchemaRootObject<ROW>> {
    return await this.fetcher.get(`${table}/schema`)
  }

  async resetCache(table = ''): Promise<void> {
    await this.fetcher.putVoid(`resetCache/${table}`)
  }

  override async getByIds<ROW extends ObjectWithId>(
    table: string,
    ids: ROW['id'][],
    opt?: CommonDBOptions,
  ): Promise<ROW[]> {
    return await this.fetcher.put(`getByIds`, {
      json: {
        table,
        ids,
        opt,
      },
    })
  }

  override async runQuery<ROW extends ObjectWithId>(
    query: DBQuery<ROW>,
    opt?: CommonDBOptions,
  ): Promise<RunQueryResult<ROW>> {
    return await this.fetcher.put(`runQuery`, {
      json: {
        query,
        opt,
      },
    })
  }

  override async runQueryCount<ROW extends ObjectWithId>(
    query: DBQuery<ROW>,
    opt?: CommonDBOptions,
  ): Promise<number> {
    return await this.fetcher.put(`runQueryCount`, {
      json: {
        query,
        opt,
      },
    })
  }

  override async saveBatch<ROW extends Partial<ObjectWithId>>(
    table: string,
    rows: ROW[],
    opt?: CommonDBSaveOptions<ROW>,
  ): Promise<void> {
    await this.fetcher.putVoid(`saveBatch`, {
      json: {
        table,
        rows,
        opt,
      },
    })
  }

  async deleteByIds(table: string, ids: string[], opt?: CommonDBOptions): Promise<number> {
    return await this.fetcher.put(`deleteByIds`, {
      json: {
        table,
        ids,
        opt,
      },
    })
  }

  override async deleteByQuery<ROW extends ObjectWithId>(
    query: DBQuery<ROW>,
    opt?: CommonDBOptions,
  ): Promise<number> {
    return await this.fetcher.put(`deleteByQuery`, {
      json: {
        query,
        opt,
      },
    })
  }

  override streamQuery<ROW extends ObjectWithId>(
    _q: DBQuery<ROW>,
    _opt?: CommonDBStreamOptions,
  ): ReadableTyped<ROW> {
    console.warn(`streamQuery not implemented`)
    return Readable.from([])
  }
}
