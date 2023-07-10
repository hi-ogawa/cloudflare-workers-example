import repl from "node:repl";
import { sql } from "kysely";
import { db, initializeDb } from ".";
import { setWorkerEnvDev } from "../utils/worker-env-dev";

// usage
// pnpm repl
// > await sql`SELECT 1 + 1`.execute(db)
// > await sql`PRAGMA table_list`.execute(db)
// > await db.selectFrom("counter").selectAll().execute()

async function main() {
  console.log("* initializing environemtnt...");
  await setWorkerEnvDev();
  await initializeDb();

  console.log("* repl is ready");
  const replServer = repl.start();
  replServer.setupHistory("./node_modules/.cache/__repl-history.txt", (e) => {
    if (e) {
      console.error("* repl histroy error", e);
    }
  });
  Object.assign(replServer.context, {
    sql,
    db,
  });
}

main();
