import { Kysely } from "kysely";
import { D1Dialect } from "kysely-d1";
import { env } from "../utils/worker-env";

export let db: Kysely<unknown>;

export async function initializeDb() {
  db = new Kysely<unknown>({
    // https://github.com/aidenwallis/kysely-d1/blob/ba48112890fd91035fb51b93dc1301e9f8e4329d/src/index.ts
    dialect: new D1Dialect({
      database: env.db,
    }),
  });
}
