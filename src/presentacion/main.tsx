import { createRoot } from "react-dom/client";
import "../index.css";
import "./presentacion.css";
import { Presentacion } from "./Presentacion";
if(new URLSearchParams(location.search).get('demo')==='1')location.replace('/demo');
document.body.classList.add('landing-body');
createRoot(document.getElementById('root')!).render(<Presentacion/>);
