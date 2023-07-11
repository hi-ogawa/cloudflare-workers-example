import cloudflareWorkersAdapter from "@hattip/adapter-cloudflare-workers/no-static";
import { createHattipEntry } from ".";
import { setEnv } from "../utils/worker-env";

const hattipHandler = createHattipEntry();

export default {
  fetch: cloudflareWorkersAdapter((ctx) => {
    setEnv((ctx.platform as any).env);
    return hattipHandler(ctx);
  }),
};
