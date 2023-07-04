import { type RequestHandler, compose } from "@hattip/compose";
import { once } from "@hiogawa/utils";
import { importIndexHtml } from "@hiogawa/vite-import-index-html/dist/runtime";
import { rpcHandler } from "../rpc/server";
import { initializeKV } from "../utils/kv";
import { runSSR } from "./ssr";

export function createHattipEntry() {
  return compose(
    errorHandler(),
    bootstrapHander(),
    rpcHandler(),
    htmlHandler()
  );
}

function htmlHandler(): RequestHandler {
  return async () => {
    let html = await importIndexHtml();
    const ssrResult = await runSSR();
    html = html.replace("<!--@INJECT_SSR@-->", ssrResult.html);
    html = html.replace("<!--@INJECT_HEAD@-->", ssrResult.head);
    return new Response(html, {
      headers: [["content-type", "text/html"]],
    });
  };
}

function bootstrapHander(): RequestHandler {
  const bootstrapOnce = once(async () => {
    await initializeKV();
  });

  return async () => {
    await bootstrapOnce();
  };
}

function errorHandler(): RequestHandler {
  return async (ctx) => {
    try {
      return await ctx.next();
    } catch (e) {
      console.error(e);
      return new Response(
        "[errorHandler] " +
          (e instanceof Error ? e.stack ?? e.message : String(e)),
        { status: 500 }
      );
    }
  };
}
