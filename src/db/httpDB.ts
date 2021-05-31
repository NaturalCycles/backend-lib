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

  override async ping(): Promise<void> {
    await this.got(`ping`)
  }

  override async getTables(): Promise<string[]> {
    return await this.got(`tables`).json()
  }

  override async getTableSchema<ROW extends ObjectWithId>(table: string): Promise<CommonSchema<ROW>> {
    return await this.got(`${table}/schema`).json()
  }

  async resetCache(table = ''): Promise<void> {
    await this.got.put(`resetCache/${table}`)
  }

  override async getByIds<ROW extends ObjectWithId>(
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

  override async runQuery<ROW extends ObjectWithId>(
    query: DBQuery<ROW>,
    opt?: CommonDBOptions,
  ): Promise<RunQueryResult<ROW>> {
    return await this.got
      .put(`runQuery`, {
        json: {
          query,
          opt,
        },
      })
      .json()
  }

  override async runQueryCount<ROW extends ObjectWithId>(
    query: DBQuery<ROW>,
    opt?: CommonDBOptions,
  ): Promise<number> {
    return await this.got
      .put(`runQueryCount`, {
        json: {
          query,
          opt,
        },
      })
      .json()
  }

  override async saveBatch<ROW extends ObjectWithId>(
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

  override async deleteByIds(table: string, ids: string[], opt?: CommonDBOptions): Promise<number> {
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

  override async deleteByQuery<ROW extends ObjectWithId>(
    query: DBQuery<ROW>,
    opt?: CommonDBOptions,
  ): Promise<number> {
    return await this.got
      .put(`deleteByQuery`, {
        json: {
          query,
          opt,
        },
      })
      .json()
  }

  override async createTable(_schema: CommonSchema, _opt?: CommonDBCreateOptions): Promise<void> {
    console.warn(`createTable not implemented`)
  }

  override streamQuery<ROW extends ObjectWithId>(
    _q: DBQuery<ROW>,
    _opt?: CommonDBStreamOptions,
  ): ReadableTyped<ROW> {
    console.warn(`streamQuery not implemented`)
    return Readable.from([])
  }
}
