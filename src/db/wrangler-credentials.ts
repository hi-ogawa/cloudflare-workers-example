import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { tinyassert } from "@hiogawa/utils";
import { z } from "zod";

//
// probe local files used by wrangler cli to get default account id and token
// for migration cli convenience
//
export async function getWranglerCredentials() {
  let accountId = process.env["D1_ACCOUNT_ID"];
  if (!accountId) {
    // https://github.com/cloudflare/workers-sdk/blob/1ce32968b990fef59953b8cd61172b98fb2386e5/packages/wrangler/src/user/user.ts#L876
    console.log(
      "* reading account id from './node_modules/.cache/wrangler/wrangler-account.json'",
    );
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
    const filePath = path.join(
      os.homedir(),
      ".config/.wrangler/config/default.toml",
    );
    tinyassert(fs.existsSync(filePath));
    const content = await fs.promises.readFile(filePath, "utf-8");

    // parse toml
    const lines = content.split("\n");
    const lineToken = lines.find((line) => line.startsWith("oauth_token = "));
    const lineExpiry = lines.find((line) =>
      line.startsWith("expiration_time = "),
    );
    tinyassert(lineToken);
    tinyassert(lineExpiry);
    token = JSON.parse(lineToken.split(" = ")[1]);
    tinyassert(token);

    // check expiration
    // guarantee only 10 minutes (note that oauth expiration seems 1 hour)
    const expiry = JSON.parse(lineExpiry.split(" = ")[1]); // JSON.parse to unquote
    if (new Date(expiry).getTime() - Date.now() < 10 * 60 * 1000) {
      throw new Error(
        "oauth_token is expired/expiring. run wrangler cli to refresh or recreate token e.g. by 'wrangler whoami'",
      );
    }
  }

  return { token, accountId };
}

const Z_WRANGLER_ACCOUNT = z.object({
  account: z.object({
    id: z.string(),
  }),
});
