import { tinyassert } from "@hiogawa/utils";
import { D1Database } from "@miniflare/d1";
import { z } from "zod";

//
// unofficial D1 driver to access D1 from any runtime
//
// the api is probably not official/stable since it doesn't appear in https://developers.cloudflare.com/api
// however you can see expected usage by wrangler/miniflare
//
// https://github.com/cloudflare/workers-sdk/blob/1ce32968b990fef59953b8cd61172b98fb2386e5/packages/wrangler/templates/middleware/middleware-d1-beta.ts#L1-L2
// https://github.com/cloudflare/workers-sdk/blob/1ce32968b990fef59953b8cd61172b98fb2386e5/packages/wrangler/src/d1/execute.tsx#L342
// https://github.com/cloudflare/miniflare/blob/7e4d906e19cc69cd3446512bfeb7f8aee3a2bda7/packages/d1/src/d1js.ts#L26
// https://github.com/cloudflare/miniflare/blob/701d2ecbb75909ffc52fe5a9037a2c09b58507f0/packages/miniflare/src/plugins/d1/gateway.ts
//

type HackyD1Config = {
  accountId: string;
  databaseId: string;
  token: string;
};

export function createHackyD1(options: HackyD1Config): D1Database {
  const d1fetch: typeof fetch = async (...args) => {
    const [url, init] = args;
    tinyassert(typeof url === "string");
    tinyassert(init);

    // TODO: we might not need "/dump" and "/execute" ?
    tinyassert(url === "/query");

    // https://github.com/cloudflare/workers-sdk/blob/1ce32968b990fef59953b8cd61172b98fb2386e5/packages/wrangler/src/environment-variables/misc-variables.ts#L52
    const url2 = `https://api.cloudflare.com/client/v4/accounts/${options.accountId}/d1/database/${options.databaseId}${url}`;

    // https://github.com/cloudflare/workers-sdk/blob/1ce32968b990fef59953b8cd61172b98fb2386e5/packages/wrangler/src/cfetch/internal.ts#L131
    const headers2 = new Headers(init.headers);
    headers2.set("authorization", "Bearer " + options.token);

    const res = await fetch(url2, {
      ...init,
      headers: headers2,
    });
    if (!res.ok) {
      const resText = await res.text();
      throw new Error("HackyD1 Error", { cause: resText });
    }

    // for some reason, response looks a bit different from what miniflare/workers-sdk expects?
    // for now, we only need to unwrap first `result`?
    // https://github.com/cloudflare/miniflare/blob/7e4d906e19cc69cd3446512bfeb7f8aee3a2bda7/packages/d1/src/d1js.ts#L141-L143
    const dummyRes = {
      json: async () => {
        const resJson = await res.json();
        const parsed = Z_QUERY_RESPONSE.parse(resJson);
        tinyassert(parsed.success);
        return parsed.result;
      },
    };
    return dummyRes as Response;
  };

  return new D1Database({ fetch: d1fetch as any });
}

const Z_QUERY_RESPONSE = z.object({
  result: z.any(),
  success: z.boolean(),
});
