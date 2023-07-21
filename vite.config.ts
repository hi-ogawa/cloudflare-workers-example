import path from "node:path";
import process from "node:process";
import importIndexHtmlPlugin from "@hiogawa/vite-import-index-html";
import vaviteConnect from "@vavite/connect";
import react from "@vitejs/plugin-react";
import * as esModuleLexer from "es-module-lexer";
import unocss from "unocss/vite";
import { type Plugin, defineConfig } from "vite";

export default defineConfig((ctx) => ({
  plugins: [
    emptyModulesPlugin({
      serverOnly: [path.join(process.cwd(), "src/rpc/server.ts")],
    }),
    react(),
    unocss(),
    importIndexHtmlPlugin(),
    vaviteConnect({
      standalone: false,
      serveClientAssetsInDev: true,
      handlerEntry:
        ctx.command === "build"
          ? "./src/server/adapter-cloudflare-workers.ts"
          : "./src/server/adapter-node.ts",
    }),
  ],
  build: {
    outDir: ctx.ssrBuild ? "dist/server" : "dist/client",
    sourcemap: true,
    rollupOptions: {
      external: ["__STATIC_CONTENT_MANIFEST"],
    },
  },
  clearScreen: false,
}));

// similar to https://github.com/remix-run/remix/blob/80c6842f547b7e83b58f1963894b07ad18c2dfe2/packages/remix-dev/compiler/plugins/emptyModules.ts#L10
// but vite needs to fake esm exports
function emptyModulesPlugin(opts: { serverOnly: string[] }): Plugin {
  return {
    name: emptyModulesPlugin.name,
    enforce: "pre",

    // (ab)use this hook to do async init
    async configResolved(_config) {
      await esModuleLexer.init;
    },

    transform(code, id, transformOpts) {
      if (!transformOpts?.ssr && opts.serverOnly.includes(id)) {
        const [_import, exports] = esModuleLexer.parse(code);
        return exports
          .map((e) =>
            e.n === "default" ? `export default {}` : `export var ${e.n} = {}`,
          )
          .join("\n");
      }
      return undefined;
    },
  };
}
