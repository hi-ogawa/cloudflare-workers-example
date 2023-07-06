import type { KVNamespace } from "@miniflare/kv";

export let env: {
  kv: KVNamespace;
};

export function setEnv(v: any) {
  env = v;
}

// setup kv for dev
export async function initializeEnv() {
  if (import.meta.env.PROD) {
    return;
  }
  const { KVNamespace } = await import("@miniflare/kv");
  const { FileStorage } = await import("@miniflare/storage-file");
  const kv = new KVNamespace(new FileStorage(".wrangler/.vite-dev/kv"));
  env = { kv };
}
