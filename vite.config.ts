import importIndexHtmlPlugin from "@hiogawa/vite-import-index-html";
import { viteNullExportPlugin } from "@hiogawa/vite-null-export";
import vaviteConnect from "@vavite/connect";
import react from "@vitejs/plugin-react";
import unocss from "unocss/vite";
import { defineConfig } from "vite";

export default defineConfig((ctx) => ({
  plugins: [
    viteNullExportPlugin({
      serverOnly: ["**/rpc/server.ts"],
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
