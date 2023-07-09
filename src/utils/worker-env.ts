import type { D1Database } from "@miniflare/d1";
import type { KVNamespace } from "@miniflare/kv";

export let env: {
  kv: KVNamespace;
  db: D1Database;
  DEBUG?: string;
} = {} as any;

export function setEnv(v: typeof env) {
  env = v;
}

export async function initializeEnv() {
  if (import.meta.env.DEV) {
    const { setWorkerEnvDev } = await import("./worker-env-dev");
    await setWorkerEnvDev();
  }
}
