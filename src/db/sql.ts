import { tinyassert } from "@hiogawa/utils";
import { env } from "../utils/worker-env";

// template literal wrapper for https://developers.cloudflare.com/d1/platform/client-api
// cf.
// https://github.com/cloudflare/workers-sdk/blob/5a74cb559611b1035fe97ebbe870d7061f3b41d0/packages/wrangler/templates/middleware/middleware-d1-beta.ts#L1-L7
// https://github.com/vercel/storage/blob/432fa33a773712b01990a8b17e9ac8877dc09f60/packages/postgres/src/sql-template.ts#L5
// https://github.com/aidenwallis/kysely-d1/blob/ba48112890fd91035fb51b93dc1301e9f8e4329d/src/index.ts#L102

type D1Primitive = number | string | null;

export async function sql<T = Record<string, D1Primitive>>(
  strings: TemplateStringsArray,
  ...values: D1Primitive[]
): Promise<T[]> {
  const query = strings.raw.join("?");
  const result = await env.db
    .prepare(query)
    .bind(...values)
    .all();
  tinyassert(result.success, result.error);
  return (result.results ?? []) as T[];
}
