import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'
import pkg from './package.json'
import { fileURLToPath, URL } from 'node:url'

function normalizeBasePath(path) {
  if (!path) return '/'
  return path.endsWith('/') ? path : path + '/'
}

const pwa = VitePWA({
  // 新 SW 就绪后自动 skipWaiting + clients.claim，无需用户手动刷新（另一选项 'prompt' 则停在 waiting 状态，由应用代码决定何时激活）
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
      { src: 'pwa-192x192.png',          sizes: '192x192', type: 'image/png' },
      { src: 'pwa-512x512.png',          sizes: '512x512', type: 'image/png' },
      { src: 'pwa-maskable-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  },
  workbox: {
    globPatterns: ['**/*.{js,css,html,ico,png,svg,json}'],
  },
})

// https://vite.dev/config/
export default defineConfig({
  base: normalizeBasePath(process.env.VITE_APP_BASE_PATH),

  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },

  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
    __BUILD_DATE__: JSON.stringify((() => {
      const d = new Date()
      const pad = (n) => String(n).padStart(2, '0')
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}-${Math.floor(d.getTime() / 1000)}`
    })()),
  },

  plugins: [vue(), pwa],

  build: {
    outDir: 'target/dist',
    emptyOutDir: true,
  },

  server: {
    host: true,  // 对外暴露服务，使得同一路由器下手机可以访问
    port: 3071,  // 固定服务端口
  }
})
