import type { RequestHandler } from "@hattip/compose";
import { createFnRecordQueryProxy } from "@hiogawa/query-proxy";
import { type TinyRpcRoutes, createTinyRpcHandler } from "@hiogawa/tiny-rpc";

let counter = 0;

export const rpcRoutes = {
  getCounter: () => counter,

  updateCounter: (delta: number) => {
    counter += delta;
    return counter;
  },
} satisfies TinyRpcRoutes;

export const rpcRoutesQuery = createFnRecordQueryProxy(rpcRoutes);

export function rpcHandler(): RequestHandler {
  return createTinyRpcHandler({
    endpoint: "/rpc",
    routes: rpcRoutes,
    onError(e) {
      console.error(e);
    },
  });
}
