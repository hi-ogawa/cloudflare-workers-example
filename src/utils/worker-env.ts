import type { D1Database } from "@miniflare/d1";
import type { KVNamespace } from "@miniflare/kv";

export let env: {
  kv: KVNamespace;
  db: D1Database;
} = {} as any;

export function setEnv(v: any) {
  env = v;
}

async function setEnvDev() {
  // dynamic import to avoid bundling node-runtime dev deps
  const { KVNamespace } = await import("@miniflare/kv");
  const { FileStorage } = await import("@miniflare/storage-file");
  const { createSQLiteDB } = await import("@miniflare/shared");
  const { D1Database, D1DatabaseAPI } = await import("@miniflare/d1");

  const process = await import("node:process");
  const NODE_ENV = process.env["NODE_ENV"] ?? "development";
  const baseDir = `.wrangler/.node-env/${NODE_ENV}/`;

  env.kv = new KVNamespace(new FileStorage(baseDir + "kv"));

  const sqlite = await createSQLiteDB(baseDir + "d1.sqlite");
  env.db = new D1Database(new D1DatabaseAPI(sqlite));
}

export async function initializeEnv() {
  if (import.meta.env.DEV) {
    await setEnvDev();
  }
}
