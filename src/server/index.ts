import { type RequestHandler, compose } from "@hattip/compose";
import { importIndexHtml } from "@hiogawa/vite-import-index-html/dist/runtime";
import { runSSR } from "./ssr";

export function createHattipEntry() {
  return compose(htmlHandler());
}

function htmlHandler(): RequestHandler {
  return async () => {
    let html = await importIndexHtml();
    const ssrHtml = runSSR();
    html = html.replace("<!--@INJECT_SSR@-->", ssrHtml);
    return new Response(html, {
      headers: [["content-type", "text/html"]],
    });
  };
}
