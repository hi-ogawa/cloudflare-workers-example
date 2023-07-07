import type { KVNamespace } from "@miniflare/kv";

export let env: {
  kv: KVNamespace;
} = {} as any;

export function setEnv(v: any) {
  env = v;
}

async function setEnvDev() {
  const { KVNamespace } = await import("@miniflare/kv");
  const { FileStorage } = await import("@miniflare/storage-file");
  env.kv = new KVNamespace(new FileStorage(".wrangler/.vite-dev/kv"));
}

// setup kv for dev
export async function initializeEnv() {
  if (import.meta.env.DEV) {
    await setEnvDev();
  }
}
