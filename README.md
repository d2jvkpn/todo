# Todo App

基于 Vue 3 + Vite + Pinia 的移动端 Todo 应用，支持中英文切换、优先级标记、导入/导出。

## 运行

```bash
npm install
npm run dev        # 开发服务器，端口 3071，局域网可访问
```

启动后终端会显示 `Network:` 地址，同一 WiFi 下的手机可直接访问。

## 打包

```bash
npm run build      # 生产构建 → target/dist/
npm run preview    # 本地预览生产构建
```

## 技术栈

- Vue 3 `<script setup>` SFC
- Vite 8
- Pinia（状态管理，数据持久化到 localStorage）
