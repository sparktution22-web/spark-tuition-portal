import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
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
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
        runtimeCaching: [
          {
            // Google Apps Script API responses: network-first so data stays fresh,
            // falling back to cache when offline.
            urlPattern: ({ url }) => url.origin === 'https://script.google.com',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'spark-api-cache',
              networkTimeoutSeconds: 8,
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 6 }
            }
          }
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
