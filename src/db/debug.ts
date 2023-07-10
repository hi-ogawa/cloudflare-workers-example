import type { D1Database } from "@miniflare/d1";

export function debugDB(db: D1Database) {
  const oldFn = db._send;
  const newFn = function (this: D1Database, ...args: Parameters<typeof oldFn>) {
    console.log("[debug:db]", ...args);
    return oldFn.apply(this, args);
  };
  db._send = newFn as any;
}
