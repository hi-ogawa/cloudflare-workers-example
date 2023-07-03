import cloudflareWorkersAdapter from "@hattip/adapter-cloudflare-workers";
import { createHattipEntry } from ".";

export default {
  fetch: cloudflareWorkersAdapter(createHattipEntry()),
};
