import {
  BaseCommonDB,
  CommonDB,
  CommonDBCreateOptions,
  CommonDBOptions,
  CommonDBSaveOptions,
  CommonDBStreamOptions,
  CommonSchema,
  DBQuery,
  ObjectWithId,
  RunQueryResult,
} from '@naturalcycles/db-lib'
import { getGot, GetGotOptions, Got, ReadableTyped } from '@naturalcycles/nodejs-lib'
import { Readable } from 'stream'

export interface HttpDBCfg extends GetGotOptions {
  prefixUrl: string
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
    this.got = getGot(cfg)
  }

  private got!: Got

  async ping(): Promise<void> {
    await this.got(`ping`)
  }

  async getTables(): Promise<string[]> {
    return await this.got(`tables`).json()
  }

  async getTableSchema<ROW extends ObjectWithId>(table: string): Promise<CommonSchema<ROW>> {
    return await this.got(`${table}/schema`).json()
  }

  async resetCache(table = ''): Promise<void> {
    await this.got.put(`resetCache/${table}`)
  }

  async getByIds<ROW extends ObjectWithId>(
    table: string,
    ids: string[],
    opt?: CommonDBOptions,
  ): Promise<ROW[]> {
    return await this.got
      .put(`getByIds`, {
        json: {
          table,
          ids,
          opt,
        },
      })
      .json()
  }

  async runQuery<ROW extends ObjectWithId, OUT = ROW>(
    query: DBQuery<ROW>,
    opt?: CommonDBOptions,
  ): Promise<RunQueryResult<OUT>> {
    return await this.got
      .put(`runQuery`, {
        json: {
          query,
          opt,
        },
      })
      .json()
  }

  async runQueryCount(query: DBQuery, opt?: CommonDBOptions): Promise<number> {
    return await this.got
      .put(`runQueryCount`, {
        json: {
          query,
          opt,
        },
      })
      .json()
  }

  async saveBatch<ROW extends ObjectWithId>(
    table: string,
    rows: ROW[],
    opt?: CommonDBSaveOptions,
  ): Promise<void> {
    await this.got.put(`saveBatch`, {
      json: {
        table,
        rows,
        opt,
      },
    })
  }

  async deleteByIds(table: string, ids: string[], opt?: CommonDBOptions): Promise<number> {
    return await this.got
      .put(`deleteByIds`, {
        json: {
          table,
          ids,
          opt,
        },
      })
      .json()
  }

  async deleteByQuery(query: DBQuery, opt?: CommonDBOptions): Promise<number> {
    return await this.got
      .put(`deleteByQuery`, {
        json: {
          query,
          opt,
        },
      })
      .json()
  }

  async createTable(schema: CommonSchema, opt?: CommonDBCreateOptions): Promise<void> {
    console.warn(`createTable not implemented`)
  }

  streamQuery<ROW extends ObjectWithId, OUT = ROW>(
    q: DBQuery<ROW>,
    opt?: CommonDBStreamOptions,
  ): ReadableTyped<OUT> {
    console.warn(`streamQuery not implemented`)
    return Readable.from([])
  }
}
