import repl from "node:repl";
import { sql } from "../rpc/server";
import { setWorkerEnvDev } from "../utils/worker-env-dev";

// pnpm repl
// > await sql`SELECT 1 + 1`.all()
// > await sql`PRAGMA table_list`.all()

async function main() {
  console.log("* initializing environemtnt...");
  await setWorkerEnvDev();

  console.log("* repl is ready");
  const replServer = repl.start();
  replServer.setupHistory("./node_modules/.cache/__repl-history.txt", (e) => {
    if (e) {
      console.error("* repl histroy error", e);
    }
  });
  Object.assign(replServer.context, {
    sql,
  });
}

main();
