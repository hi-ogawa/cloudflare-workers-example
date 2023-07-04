import { typedBoolean } from "@hiogawa/utils";
import importIndexHtmlPlugin from "@hiogawa/vite-import-index-html";
import vaviteConnect from "@vavite/connect";
import react from "@vitejs/plugin-react";
import unocss from "unocss/vite";
import { Plugin, defineConfig } from "vite";

export default defineConfig((ctx) => ({
  plugins: [
    serverOnlyModulesPlugin(),
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
      external: [
        "__STATIC_CONTENT_MANIFEST",
        !ctx.ssrBuild && "../rpc/server",
      ].filter(typedBoolean),
    },
  },
  clearScreen: false,
}));

function serverOnlyModulesPlugin(): Plugin {
  return {
    name: serverOnlyModulesPlugin.name,
    enforce: "pre",
    async resolveId(source, importer, options) {
      console.log({ source, importer, options });
      // const resolved = await this.resolve(source, importer, options);
      // if (resolved) {
      //   if (resolved.id === "/src/rpc/server.ts") {
      //     // return { }
      //   }
      // }
    },
    transform(_code, id, options) {
      if (!options?.ssr) {
        if (id.endsWith("/src/rpc/server.ts")) {
          return `module.exports = {}`;
        }
      }
      return undefined;
    },
  };
}
