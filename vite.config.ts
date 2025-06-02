import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [tailwindcss(), react()],
  base: "./",
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      external: ["electron"]
    }
  },
  server: {
    port: 5173,
    host: "localhost"
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src/renderer")
    }
  }
});
