# Vue 3 移动端 Web App 入门

## 创建项目

```bash
npm create vite@latest todo -- --template vue
cd todo
npm install
npm run dev
```

## 在手机上预览（局域网）

修改 `vite.config.js`，让开发服务器对外暴露：

```js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    host: true  // 加这一行
  }
})
```

再运行 `npm run dev`，终端会显示类似：

```
➜  Network: http://192.168.x.x:5173/
```

手机和电脑连同一个 WiFi，用手机浏览器打开这个地址就能看到效果。

## 移动端必知的 CSS

```css
/* 在 style.css 或 App.vue 里加上 */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html, body {
  font-size: 16px;
  -webkit-text-size-adjust: 100%; /* 防止横屏时字体自动放大 */
}
```
