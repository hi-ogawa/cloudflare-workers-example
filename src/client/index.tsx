import "virtual:uno.css";
import { tinyassert } from "@hiogawa/utils";
import React from "react";
import { hydrateRoot } from "react-dom/client";
import { Page } from "../routes";
import {
  ReactQueryWrapper,
  createQueryClientWithState,
} from "../utils/react-query";

function main() {
  const el = document.getElementById("root");
  tinyassert(el);

  const queryClient = createQueryClientWithState();
  const reactEl = (
    <React.StrictMode>
      <React.Suspense>
        <ReactQueryWrapper queryClient={queryClient}>
          <Page />
        </ReactQueryWrapper>
      </React.Suspense>
    </React.StrictMode>
  );
  hydrateRoot(el, reactEl);
}

main();
