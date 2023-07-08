import { createTinyRpcClientProxy } from "@hiogawa/tiny-rpc";
import type { RpcRoutes } from "./server";

export const rpcClient = createTinyRpcClientProxy<RpcRoutes>({
  endpoint: "/rpc",
});
