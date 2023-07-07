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
  const process = await import("node:process");
  const NODE_ENV = process.env["NODE_ENV"] ?? "development";
  env.kv = new KVNamespace(
    new FileStorage(`.wrangler/.node-env/${NODE_ENV}/kv`)
  );
}

export async function initializeEnv() {
  if (import.meta.env.DEV) {
    await setEnvDev();
  }
}
