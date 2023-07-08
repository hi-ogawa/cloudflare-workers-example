import path from "node:path";
import process from "node:process";
import importIndexHtmlPlugin from "@hiogawa/vite-import-index-html";
import vaviteConnect from "@vavite/connect";
import react from "@vitejs/plugin-react";
import unocss from "unocss/vite";
import { type Plugin, defineConfig } from "vite";

export default defineConfig((ctx) => ({
  plugins: [
    emptyModulesPlugin(),
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

function emptyModulesPlugin(): Plugin {
  const serverOnlyPath = path.join(process.cwd(), "/src/server-only.ts");
  return {
    name: emptyModulesPlugin.name,
    enforce: "pre",
    transform(_code, id, options) {
      if (!options?.ssr && id === serverOnlyPath) {
        return `export default {}`;
      }
      return undefined;
    },
  };
}
