import path from "path";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import comlink from 'vite-plugin-comlink';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), comlink()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  preview: {
    port: 3000,
    strictPort: true,
  },
  server: {
    port: 3000,
    strictPort: true,
    host: true,
    origin: "http://0.0.0.0:3000",
  },
  worker: {
    format: 'es', // Required for Comlink
    plugins: ()=> [comlink()] // Add any worker-specific plugins
  },
  optimizeDeps: {
    exclude: ['@tensorflow-models/body-pix', '@tensorflow/tfjs'], // Important for TensorFlow
  }
});
