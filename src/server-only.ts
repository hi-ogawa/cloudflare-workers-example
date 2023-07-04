import { rpcRoutes } from "./rpc/server";

// cf. emptyModulesPlugin in vite.config.ts

const serverOnly = {
  rpcRoutes,
};

export default serverOnly;
