import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

function normalizeBasePath(path) {
  if (!path) return '/'
  return path.endsWith('/') ? path : path + '/'
}

// https://vite.dev/config/
export default defineConfig({
  base: normalizeBasePath(process.env.VITE_APP_BASE_PATH),

  plugins: [
    vue(),
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
