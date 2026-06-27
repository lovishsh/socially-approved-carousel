import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: ["socially-approved-carousel-1.onrender.com"],
  },
  preview: {
    allowedHosts: ["socially-approved-carousel-1.onrender.com"],
  },
});