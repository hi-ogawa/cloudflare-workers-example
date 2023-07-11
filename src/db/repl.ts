import { sql } from "kysely";
import { db, initializeDb } from ".";
import { setWorkerEnvDev } from "../utils/worker-env-dev";

// usage:
// pnpm repl
// > await sql`SELECT 1 + 1`.execute(db)
// > await sql`PRAGMA table_list`.execute(db)
// > await db.selectFrom("counter").selectAll().execute()

async function main() {
  console.log("* setting up globals...");
  await setWorkerEnvDev();
  await initializeDb();
  Object.assign(globalThis, {
    sql,
    db,
  });
}

main();
