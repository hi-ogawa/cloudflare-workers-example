import "virtual:uno.css";
import { tinyassert } from "@hiogawa/utils";
import { hydrateRoot } from "react-dom/client";
import { Page } from "../routes";

function main() {
  const el = document.getElementById("root");
  tinyassert(el);
  hydrateRoot(el, <Page />);
}

main();
