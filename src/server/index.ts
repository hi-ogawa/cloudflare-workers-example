import { type RequestHandler, compose } from "@hattip/compose";
import { importIndexHtml } from "@hiogawa/vite-import-index-html/dist/runtime";
import { rpcHandler } from "../rpc/server";
import { runSSR } from "./ssr";

export function createHattipEntry() {
  return compose(rpcHandler(), htmlHandler());
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
