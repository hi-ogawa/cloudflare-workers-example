import type { RequestHandler } from "@hattip/compose";
import { type TinyRpcRoutes, createTinyRpcHandler } from "@hiogawa/tiny-rpc";
import { zodFn } from "@hiogawa/tiny-rpc/dist/zod";
import { tinyassert } from "@hiogawa/utils";
import { sql } from "kysely";
import { z } from "zod";
import { db } from "../db";
import { env } from "../utils/worker-env";

export type RpcRoutes = typeof rpcRoutes;

export const rpcRoutes = {
  getCounterKV: () => counterKV.get(),
  updateCounterKV: zodFn(z.number())(async (delta) => counterKV.update(delta)),

  getCounterD1: () => counterD1.get(),
  updateCounterD1: zodFn(z.number())(async (delta) => counterD1.update(delta)),
} satisfies TinyRpcRoutes;

export function rpcHandler(): RequestHandler {
  return createTinyRpcHandler({
    endpoint: "/rpc",
    routes: rpcRoutes,
    onError(e) {
      console.error(e);
    },
  });
}

const counterKV = {
  key: "counter",

  async get() {
    const v = await env.kv.get(counterKV.key);
    return Number(v);
  },

  async update(delta: number) {
    let v = await counterKV.get();
    v += delta;
    await env.kv.put(counterKV.key, String(v));
    return v;
  },
};

const counterD1 = {
  // singleton inserted during migration
  id: 1,

  async get() {
    // it's simple enough to get away with raw query
    // but use kysely just for the sake of testing src/db/d1-api.ts

    // d1 raw query
    sqlD1<{ value: number }>`SELECT value from counter where id = ${this.id}`;

    // kysely raw query
    sql`SELECT value from counter where id = ${this.id}`;

    // kysely query builder
    const row = await db
      .selectFrom("counter")
      .select("value")
      .where("id", "=", this.id)
      .executeTakeFirstOrThrow();
    return row.value;
  },

  async update(delta: number) {
    // d1 raw query
    sqlD1`UPDATE Counter SET value = value + ${delta} WHERE id = ${this.id} RETURNING value`;

    // kysely raw query
    sql`UPDATE Counter SET value = value + ${delta} WHERE id = ${this.id} RETURNING value`;

    // kysely query builder
    const row = await db
      .updateTable("counter")
      .set({ value: sql`value + ${delta}` })
      .where("id", "=", this.id)
      .returning("value")
      .executeTakeFirstOrThrow();
    return row.value;
  },
};

//
// simple raw query without kysely
//

type D1Primitive = number | string | null;

function sqlD1<T = Record<string, D1Primitive>>(
  strings: TemplateStringsArray,
  ...values: D1Primitive[]
): () => Promise<T[]> {
  const query = strings.raw.join("?");
  const stmt = env.db.prepare(query).bind(...values);
  return async () => {
    const result = await stmt.all();
    tinyassert(result.success, result.error);
    return (result.results ?? []) as T[];
  };
}
