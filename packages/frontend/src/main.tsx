import { render } from "preact";
import { Layout } from "./components/layout";
import "react-toastify/dist/ReactToastify.css";

const root = document.querySelector<HTMLDivElement>("#app");
if (root) render(<Layout />, root);
