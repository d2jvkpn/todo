# Todo App 设计文档

## 概述

Vue 3 移动端 Todo List，用于学习 Vue 3 核心概念、Pinia 状态管理和 localStorage 持久化。

## 技术栈

- Vue 3 + Vite（现有脚手架，位于 `my-app/`）
- Pinia（状态管理）
- 原生 CSS（移动端手写样式）
- localStorage（数据持久化）

## 功能列表

- 添加 Todo（多行文本输入，Enter = 换行）
- 勾选完成 / 取消完成（带确认弹窗）
- 双击编辑内容（textarea，Enter = 换行，Blur = 提交，Esc = 取消）
- 删除（带确认弹窗）
- 按状态筛选：未完成 / 已完成 / 全部（默认打开"未完成"）
- 颜色标记（每条 todo 可标记一种颜色）
- i18n：中文 / English
- 侧边菜单（点击 app icon 打开）：导出 JSON、导入 JSON、语言切换、关于
- 刷新页面数据不丢失

## 文件结构

```
todo/src/
├── main.js
├── App.vue
├── stores/
│   ├── todos.js
│   └── locale.js
├── components/
│   ├── TodoInput.vue
│   ├── TodoFilter.vue
│   ├── TodoList.vue
│   └── SideMenu.vue
└── style.css
```

## 数据结构

```js
// 单条 todo
{
  id: string,           // UUID 或时间戳+随机数降级
  text: string,
  status: 'active' | 'done',
  color: string | null  // null = 无颜色；否则为颜色值（如 '#ef4444'）
}

// store state
{
  todos: Todo[],
  filter: 'active' | 'done' | 'all'  // 默认 'active'
}
```

### 数据迁移

localStorage 中已有数据按以下规则迁移：

| 情况 | 迁移规则 |
|------|----------|
| 旧格式 `done: boolean` | → `status: 'done'/'active'`，`color: null` |
| 已有 `status`，缺少 `color` | → 补充 `color: null` |
| 结构完整 | → 不变 |

## 颜色系统

预定义调色盘（8 个选项）：

```js
const COLOR_PALETTE = [
  null,       // 无颜色（默认）
  '#ef4444',  // 红
  '#f97316',  // 橙
  '#eab308',  // 黄
  '#22c55e',  // 绿
  '#3b82f6',  // 蓝
  '#a855f7',  // 紫
  '#ec4899',  // 粉
]
```

**UI 表现**：todo 列表项左侧 4px 彩色边框（无颜色时为透明）。

**交互**：点击左侧彩色边框区域 → 弹出内联颜色选择器（一排色点 + 取消选项）→ 点击颜色即应用并关闭选择器。

## 组件职责

### `App.vue`
根组件，固定头部（`.app-header`）+ 可滚动内容区（`.app-body`）。头部包含 app icon（点击打开侧边菜单）、标题、TodoInput、TodoFilter。

### `TodoInput.vue`
- `<textarea>` 多行输入，Enter = 换行
- 添加按钮，输入为空时使用 `.empty` class 降低透明度（不用 `:disabled` 避免 IME 问题）

### `TodoFilter.vue`
- 三个按钮：未完成 / 已完成 / 全部
- 调用 `store.setFilter(value)`

### `TodoList.vue`
- 渲染 `store.filteredTodos`
- 每项：颜色条（可点击）、勾选框、文字（双击编辑）、删除按钮
- 颜色选择器内联展示（展开在当前 todo 项内）

### `SideMenu.vue`
- `<Teleport to="body">` 侧边抽屉
- 菜单项：导出、导入（隐藏 file input）、语言（→ 右侧子面板）、关于（→ 居中弹窗）

## Pinia Store

### `stores/todos.js`

```js
state:   { todos, filter }
getters: { filteredTodos }
actions: { addTodo, toggleTodo, editTodo, deleteTodo, setFilter, setTodoColor, exportTodos, importTodos }
```

**localStorage 同步**：`watch(todos, ..., { deep: true })`，初始化时迁移旧数据。

**ID 生成**：`window.isSecureContext ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2)`（LAN IP 访问时 crypto.randomUUID() 不可用）。

**导出**：`showSaveFilePicker`（支持时）或降级为 `<a download>`，文件名格式 `TODO.yyyy-mm-dd-timestamp.json`。

**导入**：验证 `id + text + status` 字段存在，导入后覆盖当前数据。

### `stores/locale.js`

```js
state:   { locale: 'zh' | 'en' }
getters: { t }   // computed(() => messages[locale.value])
```

`t` 包含：`placeholder, add, filters, empty, confirmDone, confirmUndone, confirmDelete, exportData, importData, importError, language, about, close, aboutDesc`。

## 移动端注意事项

- `touch-action: manipulation`：防止双击缩放
- `@media (hover: hover)`：hover 样式仅在支持 hover 的设备生效，防止移动端触摸后 hover 残留
- IME 输入：按钮不用 `:disabled`，用 CSS `.empty` 类控制外观（v-model 在输入法组合期间不更新）
