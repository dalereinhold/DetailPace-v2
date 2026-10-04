import path from "node:path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { VitePWA } from "vite-plugin-pwa"

// https://vite.dev/config/
export default defineConfig({
  // GitHub Actions sets GITHUB_ACTIONS=true automatically during deploy
  // Otherwise default to '/' for local dev, AI Studio, Bolt, and Tailscale
  base: process.env.GITHUB_ACTIONS ? "/DetailPace-v2/" : "/",
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "DetailPace v2",
        short_name: "DetailPace",
        description: "A Progressive Web App",
        id: "./",
        start_url: "./",
        scope: "./",
        display: "standalone",
        orientation: "portrait-primary",
        lang: "en",
        dir: "ltr",
        background_color: "#005f5a",
        theme_color: "#005f5a",
        icons: [
          {
            src: "icons/icon-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "icons/icon-384x384.png",
            sizes: "384x384",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "icons/icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "icons/icon-192x192-maskable.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "maskable",
          },
          {
            src: "icons/icon-512x512-maskable.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        navigateFallback: "index.html",
        clientsClaim: true,
        skipWaiting: true,
        runtimeCaching: [
          {
            urlPattern: ({ url }) =>
              url.origin === (globalThis as any).location?.origin,
            handler: "CacheFirst",
            options: {
              cacheName: "DetailPace-v2",
            },
          },
        ],
      },
    }),
  ],
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
