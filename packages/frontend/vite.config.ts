import { defineConfig } from "vite";
import preact from "@preact/preset-vite";
import env from "vite-plugin-env-compatible";
// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        preact(),
        env({
            prefix: "VITE",
        }),
    ],
    server: {
        cors: { origin: "*" },
    },
});
