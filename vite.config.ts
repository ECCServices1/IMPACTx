import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { copyFileSync } from "fs";

/**
 * GitHub Pages serves this project from /impactx/, so the build needs that base
 * path. A custom domain serves from the root instead: set BASE_PATH=/ when
 * building and everything follows, including the router's basename.
 */
const base = process.env.BASE_PATH ?? "/impactx/";

/**
 * Pages has no server-side rewrite, so a deep link like /impactx/deck/know-me
 * would 404. Pages does serve 404.html for unknown paths, and since that file is
 * the app shell, the router picks the URL up from there and renders normally.
 */
function pagesSpaFallback() {
  return {
    name: "pages-spa-fallback",
    closeBundle() {
      copyFileSync(path.resolve(__dirname, "dist/index.html"), path.resolve(__dirname, "dist/404.html"));
    },
  };
}

export default defineConfig({
  base,
  define: { __BASE_PATH__: JSON.stringify(base) },
  plugins: [react(), pagesSpaFallback()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
  test: {
    environment: "jsdom",
    globals: true,
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
  },
});
