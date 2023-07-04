import type { RequestHandler } from "@hattip/compose";
import { type TinyRpcRoutes, createTinyRpcHandler } from "@hiogawa/tiny-rpc";
import { kv } from "../utils/kv";

export const rpcRoutes = {
  getCounter: () => counter.get(),
  updateCounter: async (delta: number) => counter.update(delta),
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

const counterKey = "counter";

const counter = {
  async get() {
    const v = await kv.get(counterKey);
    return Number(v);
  },
  async update(delta: number) {
    let v = await this.get();
    v += delta;
    await kv.put(counterKey, String(v));
    return v;
  },
};
