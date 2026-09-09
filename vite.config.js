import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // Changed from 'autoUpdate' — that setting makes the PWA plugin's
      // own registration code force an IMMEDIATE page reload the moment
      // it detects a newly-deployed service worker, completely
      // independent of anything skipWaiting()/clientsClaim() do inside
      // sw.js itself. If a student had the app open and a new
      // deployment happened while it sat backgrounded, coming back to
      // the foreground could trigger this forced reload mid-session —
      // a second, separate source of the exact same "app seems to
      // reset/log out unexpectedly" symptom the sw.js fix addresses.
      // 'prompt' stops this automatic reload entirely; the app simply
      // won't force-update itself mid-session anymore, and picks up
      // the latest version the next time someone naturally closes and
      // reopens it (or manually refreshes) instead.
      registerType: 'prompt',
      // Switched from the default 'generateSW' to 'injectManifest' —
      // needed to add a custom "push" event handler for real push
      // notifications, which generateSW's fully-automatic service
      // worker has no way to support. src/sw.js (new file) now contains
      // the actual service worker logic; Vite/Workbox injects the
      // precache file list into it at build time.
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.js',
      injectManifest: {
        globPatterns: ['**/*.{js,css,html,png,svg,ico}']
      },
      includeAssets: ['spark-logo.png'],
      manifest: {
        name: 'SPARK Tuition Portal',
        short_name: 'SPARK',
        description: 'Educate • Empower • Enrich — Tuition management for admins, parents and students.',
        theme_color: '#FF6B00',
        background_color: '#F8F9FA',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: '/spark-logo.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' }
        ]
      }
    })
  ],
  server: {
    port: 5173
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 1000
  }
})
