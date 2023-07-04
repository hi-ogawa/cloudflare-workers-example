import { renderToString } from "react-dom/server";
import { Page, loader } from "../routes";
import {
  ReactQueryWrapper,
  createQueryClient,
  getQueryClientStateScript,
} from "../utils/react-query";

export async function runSSR() {
  const queryClient = createQueryClient();
  await loader({ queryClient });
  const reactEl = (
    <ReactQueryWrapper queryClient={queryClient}>
      <Page />
    </ReactQueryWrapper>
  );
  const html = renderToString(reactEl);
  const head = getQueryClientStateScript(queryClient);
  return { html, head };
}
