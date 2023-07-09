import fs from "node:fs";
import process from "node:process";
import { tinyassert } from "@hiogawa/utils";
import { consola } from "consola";
import {
  type Migration,
  type MigrationProvider,
  type MigrationResultSet,
  Migrator,
  sql,
} from "kysely";
import { db, initializeDb } from ".";
import { setWorkerEnvDev } from "../utils/worker-env-dev";

// based on https://github.com/hi-ogawa/vite-fullstack-example/blob/e7bb3b71ea4746a4817e040fc87d9ea171328396/src/db/migrate-cli.ts#L16-L23
//
// usage:
//   pnpm migrate

async function mainCli() {
  const args = process.argv.slice(2);
  const command = args[0] ?? "";

  const migrator = new Migrator({
    db,
    provider: new RawSqlMigrationProvider({
      directory: "./src/db/migrations",
    }),
  });

  switch (command) {
    case "status": {
      const result = await migrator.getMigrations();
      for (const info of result) {
        console.log(
          `${info.name}: ${info.executedAt?.toISOString() ?? "(pending)"}`,
        );
      }
      return;
    }
    case "up": {
      const result = await migrator.migrateUp();
      handleResult(result);
      return;
    }
    case "down": {
      const result = await migrator.migrateDown();
      handleResult(result);
      return;
    }
    case "latest": {
      const result = await migrator.migrateToLatest();
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
// RawSqlMigrationProvider
//

class RawSqlMigrationProvider implements MigrationProvider {
  constructor(private options: { directory: string }) {}

  async getMigrations(): Promise<Record<string, Migration>> {
    const migrations: Record<string, Migration> = {};
    const baseDir = this.options.directory;
    const nameDirs = await fs.promises.readdir(baseDir);
    for (const name of nameDirs) {
      const upFile = `${baseDir}/${name}/up.sql`;
      const downFile = `${baseDir}/${name}/down.sql`;
      tinyassert(fs.existsSync(upFile));
      migrations[name] = {
        up: await readSqlFile(upFile),
        down: fs.existsSync(downFile) ? await readSqlFile(downFile) : undefined,
      };
    }
    return migrations;
  }
}

async function readSqlFile(filepath: string): Promise<Migration["up"]> {
  // TODO: to support multiple statements, we need to split like https://github.com/cloudflare/workers-sdk/blob/1ce32968b990fef59953b8cd61172b98fb2386e5/packages/wrangler/src/d1/splitter.ts#L27
  //       for now, we rely on ad-hoc explicit marker to split.
  const content = await fs.promises.readFile(filepath, "utf-8");
  return async (db) => {
    for (const stmt of content.trim().split(SPLIT_MARKER)) {
      await sql.raw(stmt).execute(db);
    }
  };
}

const SPLIT_MARKER = "-- @@SPLIT";

//
// main
//

async function main() {
  await setWorkerEnvDev();
  await initializeDb();
  try {
    await mainCli();
  } catch (e) {
    consola.error(e);
    process.exitCode = 1;
  }
}

main();
