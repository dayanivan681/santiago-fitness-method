import { createRoot } from "react-dom/client";
import "../index.css";
import "./presentacion.css";
import { Presentacion } from "./Presentacion";
import { Demo } from "./Demo";

const demo = new URLSearchParams(window.location.search).get("demo") === "1";
document.body.classList.add(demo ? "demo-body" : "landing-body");
createRoot(document.getElementById("root")!).render(
  demo ? <Demo /> : <Presentacion />,
);
