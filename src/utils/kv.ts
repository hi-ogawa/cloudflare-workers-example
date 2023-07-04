import { tinyassert } from "@hiogawa/utils";
import type { KVNamespace } from "@miniflare/kv";

export let kv: KVNamespace;

declare let kvMain: any;

export async function initializeKV() {
  if (import.meta.env.PROD) {
    tinyassert(typeof kvMain !== "undefined");
    kv = kvMain;
  } else {
    // dynmaic import to avoid bundling on release build
    const { KVNamespace } = await import("@miniflare/kv");
    const { MemoryStorage } = await import("@miniflare/storage-memory");
    kv = new KVNamespace(new MemoryStorage());
  }
}
