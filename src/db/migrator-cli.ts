import process from "node:process";
import { consola } from "consola";
import { env } from "../utils/worker-env";
import { setWorkerEnvDev } from "../utils/worker-env-dev";
import {
  type MigrationResultSet,
  Migrator,
  rawSqlMigrationDriver,
  rawSqlMigrationProvider,
} from "./migrator";

// based on https://github.com/hi-ogawa/vite-fullstack-example/blob/e7bb3b71ea4746a4817e040fc87d9ea171328396/src/db/migrate-cli.ts#L16-L23
//
// usage:
//   pnpm migrate

async function mainCli() {
  const args = process.argv.slice(2);
  const command = args[0] ?? "";

  const migrator = new Migrator({
    provider: rawSqlMigrationProvider({ directory: "src/db/migrations" }),
    driver: rawSqlMigrationDriver({
      table: "sql_migrations",
      async execute(query, params) {
        query;
        params;
        env.db;
        return [];
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
      result;
      // for (const info of result) {
      //   console.log(
      //     `${info.name}: ${info.executedAt?.toISOString() ?? "(pending)"}`,
      //   );
      // }
      return;
    }
    case "up": {
      const result = await migrator.up();
      handleResult(result);
      return;
    }
    case "down": {
      const result = await migrator.down();
      handleResult(result);
      return;
    }
    case "latest": {
      const result = await migrator.latest();
      handleResult(result);
      return;
    }
    default: {
      throw new Error("unkonwn command", { cause: command });
    }
  }
}

function handleResult(result: MigrationResultSet) {
  console.log(":: executed migrations");
  console.log(result.results);
  if (result.error) {
    throw result.error;
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
