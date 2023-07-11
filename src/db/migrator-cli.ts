import process from "node:process";
import {
  Migrator,
  MigratorCli,
  rawSqlMigrationDriver,
  rawSqlMigrationProvider,
} from "@hiogawa/tiny-sql";
import { consola } from "consola";
import { env } from "../utils/worker-env";
import { setWorkerEnvDev } from "../utils/worker-env-dev";

// migration cli based on "tiny-sql" https://github.com/hi-ogawa/js-utils/pull/61

async function mainCli() {
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

        // poor-man's sql statement split works for now
        const queries = raw
          .trim()
          .split(/;\n/)
          .map((s) => s.trim())
          .filter(Boolean);
        for (const query of queries) {
          await env.db.prepare(query).all();
        }
      },
    }),
  });

  const cli = new MigratorCli(migrator);
  await cli.parseAndRun(process.argv.slice(2));
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
