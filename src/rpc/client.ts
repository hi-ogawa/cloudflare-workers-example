import { createTinyRpcClientProxy } from "@hiogawa/tiny-rpc";
import { rpcRoutes } from "./server";

export const rpcClient = createTinyRpcClientProxy<typeof rpcRoutes>({
  endpoint: "/rpc",
});
