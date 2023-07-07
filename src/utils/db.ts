import { tinyassert } from "@hiogawa/utils";
import { env } from "./worker-env";

// template literal wrapper for https://developers.cloudflare.com/d1/platform/client-api
// cf.
// https://github.com/vercel/storage/blob/432fa33a773712b01990a8b17e9ac8877dc09f60/packages/postgres/src/sql-template.ts#L5
// https://github.com/aidenwallis/kysely-d1/blob/ba48112890fd91035fb51b93dc1301e9f8e4329d/src/index.ts#L102
export async function sql<T = unknown>(
  strings: TemplateStringsArray,
  ...values: (number | string | null)[]
): Promise<T[]> {
  const query = strings.raw.join("?");
  const result = await env.db
    .prepare(query)
    .bind(...values)
    .all();
  tinyassert(result.success, result.error);
  return (result.results ?? []) as T[];
}

export async function migrateStatus() {
  const result = await env.db.batch([
    env.db.prepare("PRAGMA table_list"),
    env.db.prepare("PRAGMA table_info(my_table)"),
  ]);
  console.log(result);
}

export async function migrateUp() {
  const result = env.db.exec(`
CREATE TABLE "counter" (
  "id" SERIAL NOT NULL,
  "value" INTEGER NOT NULL,
  CONSTRAINT "counter_pkey" PRIMARY KEY ("id")
);
  `);
  console.log(result);
}

export async function migrateDown() {
  const result = env.db.exec(`
DROP TABLE "counter";
  `);
  console.log(result);
}
