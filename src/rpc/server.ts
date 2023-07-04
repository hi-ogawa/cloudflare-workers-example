import type { RequestHandler } from "@hattip/compose";
import { type TinyRpcRoutes, createTinyRpcHandler } from "@hiogawa/tiny-rpc";
import { zodFn } from "@hiogawa/tiny-rpc/dist/zod";
import { z } from "zod";
import { kv } from "../utils/kv";

export const rpcRoutes = {
  getCounter: () => counter.get(),
  updateCounter: zodFn(z.number())(async (delta) => counter.update(delta)),
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

//
// counter on KV
//

const counter = {
  key: "counter",

  async get() {
    const v = await kv.get(counter.key);
    return Number(v);
  },

  async update(delta: number) {
    let v = await counter.get();
    v += delta;
    await kv.put(counter.key, String(v));
    return v;
  },
};
