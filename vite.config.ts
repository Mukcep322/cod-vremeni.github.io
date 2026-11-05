import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base "./" — сайт работает из любой папки, в том числе на GitHub Pages
export default defineConfig({
  base: "./",
  plugins: [react()],
});
