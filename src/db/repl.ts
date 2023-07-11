import { setWorkerEnvDev } from "../utils/worker-env-dev";
import { sql } from "./sql";

// usage:
// pnpm repl
// > await sql`SELECT 1 + 1`.all()
// > await sql`PRAGMA table_list`.all()

async function main() {
  console.log("* setting up globals...");
  await setWorkerEnvDev();
  Object.assign(globalThis, {
    sql,
  });
}

main();
