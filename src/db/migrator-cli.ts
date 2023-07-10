import process from "node:process";
import { consola } from "consola";
import { env } from "../utils/worker-env";
import { setWorkerEnvDev } from "../utils/worker-env-dev";
import {
  Migrator,
  rawSqlMigrationDriver,
  rawSqlMigrationProvider,
} from "./migrator";

async function mainCli() {
  const args = process.argv.slice(2);
  const command = args[0] ?? "";

  const migrator = new Migrator({
    provider: rawSqlMigrationProvider({ directory: "src/db/migrations" }),
    driver: rawSqlMigrationDriver({
      table: "sql_migrations",
      async execute(query) {
        return env.db.prepare(query).raw();
      },
      async executeRaw(query) {
        await env.db.exec(query);
      },
    }),
  });

  switch (command) {
    case "status": {
      await migrator.init();
      return;
    }
    case "status": {
      const result = await migrator.status();
      for (const [name, e] of result.map) {
        console.log(name, ":", e.state?.executedAt ?? "(pending)");
      }
      return;
    }
    case "up":
    case "down":
    case "latest": {
      const result = await migrator[command]();
      console.log(":: executed migrations");
      for (const r of result.results) {
        console.log(r.name, r.status, r.direction);
      }
      if (result.error) {
        throw result.error;
      }
      return;
    }
    default: {
      throw new Error("unkonwn command", { cause: command });
    }
  }
}

//
// main
//

async function main() {
  await setWorkerEnvDev();
  try {
    await mainCli();
  } catch (e) {
    consola.error(e);
    process.exitCode = 1;
  }
}

main();
