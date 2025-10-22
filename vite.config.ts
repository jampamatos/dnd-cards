import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/icon-192.png', 'icons/icon-512.png'],
      manifest: {
        name: 'D&D Cards',
        short_name: 'D&D Cards',
        description: 'Cards de magia e features para D&D com impressão',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        scope: '/dnd-cards',
        start_url: '/dnd-cards',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose:'maskable any' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose:'maskable any' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json}'],
        navigateFallbackDenylist: [/^\/dnd-cards\/assets\//],
      }
    })
  ],
  base: '/dnd-cards',
})
