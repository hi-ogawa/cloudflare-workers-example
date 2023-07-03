import { renderToString } from "react-dom/server";
import { Page } from "../routes";

export function runSSR() {
  return renderToString(<Page />);
}
