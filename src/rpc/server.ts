import type { RequestHandler } from "@hattip/compose";
import { type TinyRpcRoutes, createTinyRpcHandler } from "@hiogawa/tiny-rpc";
// TOOD: don't bundle for PROD
import { KVNamespace } from "@miniflare/kv";
import { MemoryStorage } from "@miniflare/storage-memory";

let counter = createCounter();

export const rpcRoutes = {
  getCounter: () => counter.get(),
  updateCounter: (delta: number) => counter.update(delta),
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

function createCounter() {
  const kv: KVNamespace = import.meta.env.PROD
    ? (globalThis as any).kv
    : new KVNamespace(new MemoryStorage());
  const key = "counter";

  return {
    async get() {
      const v = await kv.get(key);
      return Number(v);
    },
    async update(delta: number) {
      let v = await this.get();
      v += delta;
      await kv.put(key, String(v));
      return v;
    },
  };
}
