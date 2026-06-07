import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'sakura.png', 'bg-auth.jpg'],
      manifest: {
        name: 'Glow',
        short_name: 'Glow',
        start_url: '/',
        display: 'standalone',
        theme_color: '#F0E5D4',
        background_color: '#F0E5D4',
        icons: []
      },
      workbox: {
        // ГЛАВНОЕ: стратегии кэширования
        runtimeCaching: [
          {
            // API запросы
            urlPattern: /^http:\/\/localhost:5000\/api\/.*/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              networkTimeoutSeconds: 5,
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 24 * 60 * 60
              }
            }
          },
          {
            // Иконки из public/icons/
            urlPattern: /\/icons\/.*\.svg/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'icons-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 30 * 24 * 60 * 60
              }
            }
          },
          {
            // Изображения
            urlPattern: /\.(png|jpg|jpeg)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 30 * 24 * 60 * 60
              }
            }
          }
        ],
        // Fallback для SPA
        navigateFallback: 'index.html',
        navigateFallbackDenylist: [/^\/api\//]
      }
    })
  ],
  server: {
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  }
});