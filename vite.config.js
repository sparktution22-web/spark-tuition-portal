import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
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
