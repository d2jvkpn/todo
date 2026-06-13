import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'
import pkg from './package.json'

function normalizeBasePath(path) {
  if (!path) return '/'
  return path.endsWith('/') ? path : path + '/'
}

// https://vite.dev/config/
export default defineConfig({
  base: normalizeBasePath(process.env.VITE_APP_BASE_PATH),
  define: { __APP_VERSION__: JSON.stringify(pkg.version) },

  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['app.json', 'favicon.svg'],
      manifest: {
        name: 'TODO',
        short_name: 'TODO',
        description: 'A minimal mobile todo app',
        theme_color: '#f2f2f7',
        background_color: '#f2f2f7',
        display: 'standalone',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'pwa-maskable-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json}'],
      },
    }),
  ],

  build: {
    outDir: 'target/dist',
    emptyOutDir: true,
  },

  server: {
    host: true,  // 对外暴露服务，使得同一路由器下手机可以访问
    port: 3071,  // 固定服务端口
  }
})
