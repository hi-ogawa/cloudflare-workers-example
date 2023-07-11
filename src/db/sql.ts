import { tinyassert } from "@hiogawa/utils";
import { env } from "../utils/worker-env";

//
// quick and dirty raw query buider
//

type D1Primitive = number | string | null;

export function sql<T = Record<string, D1Primitive>>(
  strings: TemplateStringsArray,
  ...values: D1Primitive[]
) {
  const query = strings.raw.join("?");
  const stmt = env.db.prepare(query).bind(...values);
  const self = {
    all: async (): Promise<T[]> => {
      const result = await stmt.all();
      tinyassert(result.success, result.error);
      return (result.results ?? []) as T[];
    },
    first: async (): Promise<T | undefined> => {
      const rows = await self.all();
      return rows[0];
    },
    firstOrThrow: async (): Promise<T> => {
      const row = await self.first();
      if (typeof row === "undefined") {
        throw new Error("sql.firstOrThrow", { cause: { query, values } });
      }
      return row;
    },
  };
  return self;
}
