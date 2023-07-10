import process from "node:process";
import { consola } from "consola";
import { env } from "../utils/worker-env";
import { setWorkerEnvDev } from "../utils/worker-env-dev";
import {
  Migrator,
  rawSqlMigrationDriver,
  rawSqlMigrationProvider,
} from "./migrator";

// knex/kysely like migration cli

async function mainCli() {
  const args = process.argv.slice(2);
  const command = args[0] ?? "";

  const migrator = new Migrator({
    provider: rawSqlMigrationProvider({ directory: "src/db/migrations" }),
    driver: rawSqlMigrationDriver({
      table: "migration_states",
      async execute(query) {
        const all = await env.db.prepare(query).all();
        return all.results ?? [];
      },
      async executeRaw(raw) {
        // D1 `exec` allows only "\n"-separated multi statements, so we have to analyze query on our own anyways...
        // https://github.com/cloudflare/miniflare/blob/7e4d906e19cc69cd3446512bfeb7f8aee3a2bda7/packages/d1/src/d1js.ts#L74-L76
        // https://developers.cloudflare.com/d1/platform/client-api/#await-dbexec
        // > The input can be one or multiple queries separated by \n.

        // poor-man's sql statement split...
        const queries = raw
          .trim()
          .split(/;\n/)
          .map((s) => s.trim())
          .filter(Boolean);
        await env.db.batch(queries.map((q) => env.db.prepare(q)));
      },
    }),
  });

  switch (command) {
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
      console.log("* executed migrations");
      for (const r of result.results) {
        console.log(r.name, ":", r.status, "-", r.direction);
      }
      if (result.error) {
        throw result.error;
      }
      return;
    }
    case "-h":
    case "help": {
      console.log("available commands: status, up, down, latest");
      return;
    }
  }
  throw new Error(`unknown command '${command}'`);
}

//
// main
//

async function main() {
  await setWorkerEnvDev();
  try {
    await mainCli();
  } catch (e) {
    for (const inner of traverseErrorCause(e)) {
      consola.error(inner);
    }
    process.exitCode = 1;
  }
}

function traverseErrorCause(e: unknown): unknown[] {
  let errors: unknown[] = [e];
  for (let i = 0; ; i++) {
    if (i > 100) throw new Error("bound loop just in case");
    if (e instanceof Error && e.cause && !errors.includes(e.cause)) {
      errors.push(e.cause);
      e = e.cause;
      continue;
    }
    break;
  }
  return errors;
}

main();
