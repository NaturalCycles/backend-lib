import {
  CommonDB,
  CommonDBCreateOptions,
  CommonDBOptions,
  CommonDBSaveOptions,
  CommonDBStreamOptions,
  CommonSchema,
  DBQuery,
  RunQueryResult,
  SavedDBEntity,
} from '@naturalcycles/db-lib'
import { getGot, GetGotOptions, ReadableTyped } from '@naturalcycles/nodejs-lib'
import { Got } from 'got'
import { Readable } from 'stream'

export interface HttpDBCfg extends GetGotOptions {
  prefixUrl: string
}

/**
 * Implementation of CommonDB that proxies all requests via HTTP to "httpDBRequestHandler".
 */
export class HttpDB implements CommonDB {
  constructor(public cfg: HttpDBCfg) {
    this.setCfg(cfg)
  }

  setCfg(cfg: HttpDBCfg): void {
    const { prefixUrl } = cfg

    this.got = getGot(cfg).extend({
      prefixUrl,
    })
  }

  private got!: Got

  async ping(): Promise<void> {
    await this.got(`ping`)
  }

  async getTables(): Promise<string[]> {
    return await this.got(`tables`).json()
  }

  async getTableSchema<DBM extends SavedDBEntity>(table: string): Promise<CommonSchema<DBM>> {
    return await this.got(`${table}/schema`).json()
  }

  async resetCache(table = ''): Promise<void> {
    await this.got.put(`resetCache/${table}`)
  }

  async getByIds<DBM extends SavedDBEntity>(
    table: string,
    ids: string[],
    opt?: CommonDBOptions,
  ): Promise<DBM[]> {
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

  async runQuery<DBM extends SavedDBEntity, OUT = DBM>(
    query: DBQuery<any, DBM>,
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

  async saveBatch<DBM extends SavedDBEntity>(
    table: string,
    dbms: DBM[],
    opt?: CommonDBSaveOptions,
  ): Promise<void> {
    await this.got.put(`saveBatch`, {
      json: {
        table,
        dbms,
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

  streamQuery<DBM extends SavedDBEntity, OUT = DBM>(
    q: DBQuery<any, DBM>,
    opt?: CommonDBStreamOptions,
  ): ReadableTyped<OUT> {
    console.warn(`streamQuery not implemented`)
    return Readable.from([])
  }
}
