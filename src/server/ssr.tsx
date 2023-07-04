import React from "react";
import { Page } from "../routes";
import {
  ReactQueryWrapper,
  createQueryClient,
  getQueryClientStateScript,
} from "../utils/react-query";

export async function runSSR() {
  const queryClient = createQueryClient();

  const reactEl = (
    <React.StrictMode>
      <ReactQueryWrapper queryClient={queryClient}>
        <Page />
      </ReactQueryWrapper>
    </React.StrictMode>
  );

  //
  // emulate "ssr prepass" by `Suspense` and `allReady`
  //

  // workaround import error
  const { renderToReadableStream }: typeof import("react-dom/server") =
    await import("react-dom/server.browser" as string);

  const reactStream = await renderToReadableStream(reactEl, {
    onError(error, errorInfo) {
      console.error(error, errorInfo);
    },
  });
  await reactStream.allReady;

  let html = "";
  const decoder = new TextDecoder();
  for await (const chunk of reactStream as any as AsyncIterable<Uint8Array>) {
    html += decoder.decode(chunk);
  }

  const head = getQueryClientStateScript(queryClient);
  return { html, head };
}
