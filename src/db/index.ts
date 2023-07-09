import { Kysely } from "kysely";
import { env } from "../utils/worker-env";
import { D1Dialect } from "./d1-kysely";
import type { KyselyTables } from "./schema";

export let db: Kysely<KyselyTables>;

export async function initializeDb() {
  db = new Kysely<KyselyTables>({
    dialect: new D1Dialect(env.db),
    // dump query executed by kysely e.g.
    //   DEBUG=kysely pnpm migrate status
    log: env.DEBUG?.includes("kysely") ? ["error", "query"] : undefined,
  });
}
