import type { RequestHandler } from "@hattip/compose";
import { type TinyRpcRoutes, createTinyRpcHandler } from "@hiogawa/tiny-rpc";
import { zodFn } from "@hiogawa/tiny-rpc/dist/zod";
import { z } from "zod";
import { sql } from "../db/sql";
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
    const row = await sql<{
      value: number;
    }>`SELECT value from counter where id = ${this.id}`.firstOrThrow();
    return row.value;
  },

  async update(delta: number) {
    const row = await sql<{
      value: number;
    }>`UPDATE counter SET value = value + ${delta} WHERE id = ${this.id} RETURNING value`.firstOrThrow();
    return row.value;
  },
};
