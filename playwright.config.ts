/// <reference types="node" />
import process from "node:process";
import { defineConfig } from "@playwright/test";

const webServerCommand =
  process.env["E2E_WEB_SERVER_COMMAND"] ?? "NODE_ENV=test pnpm dev";

export default defineConfig({
  testDir: "e2e",
  use: {
    baseURL: `http://localhost:5173`,
  },
  projects: [
    {
      name: "chromium",
      use: {
        browserName: "chromium",
        // adapt viewport size to browser window size specified below. otherwise viewport will get cropped.
        // https://github.com/microsoft/playwright/issues/1086#issuecomment-592227413
        viewport: null,
        launchOptions: {
          args: ["--window-size=600,800"],
        },
      },
    },
  ],
  webServer: {
    command: `${webServerCommand} >> dev-e2e.log 2>&1`,
    port: 5173,
    reuseExistingServer: true,
  },
  forbidOnly: Boolean(process.env["CI"]),
});
