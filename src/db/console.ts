import process from "node:process";
import { tinyassert } from "@hiogawa/utils";
import { Kysely, sql } from "kysely";
import { D1Dialect } from "kysely-d1";
import { z } from "zod";
import { createHackyD1 } from "./hacky-d1";

// usage
// D1_DATABASE_ID=b7ae526e-5a2b-4c16-8d7d-4a5983c4f1f1 npx tsx -r ./src/db/console.ts
// > await sql`SELECT 1 + 1`.execute(db)
// > await sql`PRAGMA table_list`.execute(db)

async function main() {
  const db = await createDb();
  Object.assign(globalThis, {
    sql,
    db,
  });
}

async function createDb() {
  const databaseId = process.env["D1_DATABASE_ID"];
  tinyassert(databaseId, "D1_DATABASE_ID is required");

  //
  // probe local files used by wrangler cli to get default D1_ACCOUNT_ID and D1_API_TOKEN
  //
  let accountId = process.env["D1_ACCOUNT_ID"];
  if (!accountId) {
    // https://github.com/cloudflare/workers-sdk/blob/1ce32968b990fef59953b8cd61172b98fb2386e5/packages/wrangler/src/user/user.ts#L876
    console.log(
      "* reading account id from './node_modules/.cache/wrangler/wrangler-account.json'",
    );
    const path = await import("node:path");
    const process = await import("node:process");
    const fs = await import("node:fs");
    const filePath = path.join(
      process.cwd(),
      "node_modules/.cache/wrangler/wrangler-account.json",
    );
    tinyassert(fs.existsSync(filePath));
    const data = JSON.parse(await fs.promises.readFile(filePath, "utf-8"));
    const parsed = Z_WRANGLER_ACCOUNT.parse(data);
    accountId = parsed.account.id;
  }

  let token = process.env["D1_API_TOKEN"];
  if (!token) {
    // https://github.com/cloudflare/workers-sdk/blob/1ce32968b990fef59953b8cd61172b98fb2386e5/packages/wrangler/src/user/user.ts#L1188
    console.log(
      "* reading api token from '~/.config/.wrangler/config/default.toml'",
    );
    const path = await import("node:path");
    const os = await import("node:os");
    const fs = await import("node:fs");
    const filePath = path.join(
      os.homedir(),
      ".config/.wrangler/config/default.toml",
    );
    tinyassert(fs.existsSync(filePath));
    const content = await fs.promises.readFile(filePath, "utf-8");
    const lines = content.split("\n");
    const lineToken = lines.find((line) => line.startsWith("oauth_token = "));
    const lineExpiry = lines.find((line) =>
      line.startsWith("expiration_time = "),
    );
    tinyassert(lineToken);
    tinyassert(lineExpiry);
    const expiry = JSON.parse(lineExpiry.split(" = ")[1]); // JSON.parse to unquote
    // guarantee only 10 minutes (note that oauth expiration seems 1 hour)
    if (new Date(expiry).getTime() - Date.now() < 10 * 60 * 1000) {
      throw new Error(
        "oauth_token is expired/expiring. run wrangler cli to refresh or recreate token e.g. by 'wrangler whoami'",
      );
    }
    token = JSON.parse(lineToken.split(" = ")[1]);
  }
  tinyassert(token);

  const db = new Kysely<unknown>({
    dialect: new D1Dialect({
      database: createHackyD1({
        accountId,
        databaseId,
        token,
      }),
    }),
    log: ["query", "error"],
  });

  return db;
}

const Z_WRANGLER_ACCOUNT = z.object({
  account: z.object({
    id: z.string(),
  }),
});

main();
