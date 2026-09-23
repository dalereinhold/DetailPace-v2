import path from "node:path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig({
  // GitHub Actions sets GITHUB_ACTIONS=true automatically during deploy
  // Otherwise default to '/' for local dev, AI Studio, Bolt, and Tailscale
  base: process.env.GITHUB_ACTIONS ? '/DetailPace-v2/' : '/',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
  server: {
    // HMR is disabled in AI Studio via DISABLE_HMR env var.
    // Do not modify file watching is disabled to prevent flickering during agent edits.
    hmr: process.env.DISABLE_HMR !== "true",
    // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
    watch: process.env.DISABLE_HMR === "true" ? null : {},
  },
})
