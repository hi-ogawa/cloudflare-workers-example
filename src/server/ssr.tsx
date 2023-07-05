import React from "react";
import { Page, PagePrepass } from "../routes";
import {
  ReactQueryWrapper,
  createQueryClient,
  getQueryClientStateScript,
} from "../utils/react-query";

// @ts-expect-error prettier-ignore
import * as reactDomServer from "react-dom/server.browser";
const { renderToReadableStream, renderToString } =
  reactDomServer as typeof import("react-dom/server");

export async function runSSR() {
  const queryClient = createQueryClient();

  // 1st pass to prefetch queries (aka prepass)
  const reactPrepassEl = (
    <ReactQueryWrapper queryClient={queryClient}>
      <PagePrepass />
    </ReactQueryWrapper>
  );
  const reactStream = await renderToReadableStream(reactPrepassEl, {
    onError(error, errorInfo) {
      console.error(error, errorInfo);
    },
  });
  await reactStream.allReady;

  // 2nd pass to render html
  const reactEl = (
    <React.StrictMode>
      <ReactQueryWrapper queryClient={queryClient}>
        <Page />
      </ReactQueryWrapper>
    </React.StrictMode>
  );
  const html = renderToString(reactEl);

  const head = getQueryClientStateScript(queryClient);
  return { html, head };
}
