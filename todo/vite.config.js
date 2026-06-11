import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
  ],

  server: {
    host: true,  // 对外暴露服务，使得同一路由器下手机可以访问
    port: 3071,  // 固定服务端口
  }
})
