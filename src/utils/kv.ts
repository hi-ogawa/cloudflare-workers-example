import type { KVNamespace } from "@miniflare/kv";

export let kv: KVNamespace;

export async function initializeKV() {
  if (import.meta.env.PROD) {
    kv = (globalThis as any).env.kvMain;
  } else {
    // dynmaic import to avoid bundling on release build
    const { KVNamespace } = await import("@miniflare/kv");
    const { MemoryStorage } = await import("@miniflare/storage-memory");
    kv = new KVNamespace(new MemoryStorage());
  }
}
