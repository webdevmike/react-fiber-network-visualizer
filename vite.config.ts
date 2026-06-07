import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";
import { basePath } from "./app/config";

export default defineConfig({
  base: basePath,
  plugins: [reactRouter()],
  css: {
    modules: {
      localsConvention: "camelCase",
    },
  },
  resolve: {
    tsconfigPaths: true,
  },
});
