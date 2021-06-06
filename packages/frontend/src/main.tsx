import { render } from "preact";
import { Layout } from "./components/layout";
import "react-toastify/dist/ReactToastify.css";
import "@fontsource/fira-code";

const root = document.querySelector<HTMLDivElement>("#app");
if (root) render(<Layout />, root);
