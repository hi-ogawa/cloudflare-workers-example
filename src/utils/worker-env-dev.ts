import process from "node:process";
import { D1Database, D1DatabaseAPI } from "@miniflare/d1";
import { KVNamespace } from "@miniflare/kv";
import { createSQLiteDB } from "@miniflare/shared";
import { FileStorage } from "@miniflare/storage-file";
import { createD1Api } from "../db/d1-api";
import { getWranglerCredentials } from "../db/wrangler-credentials";
import { setEnv } from "./worker-env";

// also used for repl/migration cli
// (note that cli doesn't go through vite, so we cannot rely on e.g. `import.meta.env`)
export async function setWorkerEnvDev() {
  const NODE_ENV = process.env["NODE_ENV"] ?? "development";
  const baseDir = `.wrangler/.node-env/${NODE_ENV}/`;

  const kv = new KVNamespace(new FileStorage(baseDir + "kv"));

  let db: D1Database;
  if (process.env["D1_DATABASE_ID"]) {
    // use d1-api driver to access remote d1
    const { accountId, token } = await getWranglerCredentials();
    db = createD1Api({
      databaseId: process.env["D1_DATABASE_ID"],
      accountId,
      token,
    });
  } else {
    // explicit local path for preview (or fallback to local dev path)
    const sqlitePath = process.env["D1_SQLITE_PATH"] ?? baseDir + "d1.sqlite";
    const sqlite = await createSQLiteDB(sqlitePath);
    db = new D1Database(new D1DatabaseAPI(sqlite));
  }

  setEnv({
    kv,
    db,
    DEBUG: process.env["DEBUG"],
  });
}
