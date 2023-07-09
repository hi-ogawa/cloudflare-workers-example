import type { D1Database } from "@miniflare/d1";
import {
  CompiledQuery,
  type DatabaseConnection,
  type Dialect,
  type Driver,
  Kysely,
  type QueryResult,
  SqliteAdapter,
  SqliteIntrospector,
  SqliteQueryCompiler,
} from "kysely";

//
// kysely dialect for D1Database
// cf. https://github.com/aidenwallis/kysely-d1/blob/ba48112890fd91035fb51b93dc1301e9f8e4329d/src/index.ts
//
// currently "kysely-d1" package provides only commonjs build and thus it leads to
// "kysely" module eduplicated in the bundle.
// so just do the trivial implementaion here by ourselves instead.
//

export class D1Dialect implements Dialect {
  constructor(private db: D1Database) {}
  createDriver = () => new D1Driver(this.db);
  createQueryCompiler = () => new SqliteQueryCompiler();
  createAdapter = () => new SqliteAdapter(); // supportsTransactionalDdl = false https://github.com/kysely-org/kysely/blob/4a95f6be83be7bf50a8cf5fa313fe4345a7d1ffd/src/dialect/sqlite/sqlite-adapter.ts#L5
  createIntrospector = (db: Kysely<any>) => new SqliteIntrospector(db);
}

export class D1Driver implements Driver {
  constructor(private db: D1Database) {}
  init = noop;
  acquireConnection = async () => new D1DatabaseConnection(this.db);
  beginTransaction = unsupported;
  commitTransaction = unsupported;
  rollbackTransaction = unsupported;
  releaseConnection = noop;
  destroy = noop;
}

export class D1DatabaseConnection implements DatabaseConnection {
  constructor(private db: D1Database) {}

  async executeQuery<R>(q: CompiledQuery): Promise<QueryResult<R>> {
    const res = await this.db
      .prepare(q.sql)
      .bind(...q.parameters)
      .all<R>();
    if (!res.success) {
      throw new Error("D1Dialect error", { cause: res.error });
    }

    // assume metadata as miniflare does
    // https://github.com/cloudflare/miniflare/blob/7e4d906e19cc69cd3446512bfeb7f8aee3a2bda7/packages/d1/src/api.ts#L132-L133
    const insertId =
      typeof res.meta.last_row_id !== "undefined"
        ? BigInt(res.meta.last_row_id)
        : undefined;
    const changes =
      typeof res.meta.changes !== "undefined"
        ? BigInt(res.meta.changes)
        : undefined;

    return {
      rows: res.results ?? [],
      insertId,
      numChangedRows: changes,
      numAffectedRows: changes,
    };
  }

  streamQuery = unsupported;
}

const unsupported: any = () => {
  throw new Error("unsupported");
};
const noop = async () => {};
