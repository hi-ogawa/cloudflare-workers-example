import { type RequestHandler, compose } from "@hattip/compose";
import { once } from "@hiogawa/utils";
import { loggerMiddleware } from "@hiogawa/utils-experimental";
import { importIndexHtml } from "@hiogawa/vite-import-index-html/dist/runtime";
import { initializeDb } from "../db";
import { rpcHandler } from "../rpc/server";
import { initializeEnv } from "../utils/worker-env";
import { runSSR } from "./ssr";

export function createHattipEntry() {
  return compose(
    loggerMiddleware(),
    errorHandler(),
    bootstrapHander(),
    rpcHandler(),
    htmlHandler(),
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
  return once(async () => {
    await initializeEnv();
    await initializeDb();
  });
}

function errorHandler(): RequestHandler {
  return async (ctx) => {
    ctx.handleError = (e) => {
      console.error(e);
      return new Response(
        "[errorHandler] " +
          (e instanceof Error ? e.stack ?? e.message : String(e)),
        { status: 500 },
      );
    };
  };
}
