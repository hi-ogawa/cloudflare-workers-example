import { tinyassert } from "@hiogawa/utils";
import type { KVNamespace } from "@miniflare/kv";
import { requestContextStorage } from "../server/request-context";

export let kv: KVNamespace;

export async function initializeKV() {
  if (import.meta.env.PROD) {
    const ctx = requestContextStorage.getStore();
    tinyassert(ctx);
    kv = (ctx.platform as any).env.kvMain;
  } else {
    // dynmaic import to avoid bundling on release build
    const { KVNamespace } = await import("@miniflare/kv");
    const { MemoryStorage } = await import("@miniflare/storage-memory");
    kv = new KVNamespace(new MemoryStorage());
  }
}
