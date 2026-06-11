# Todo App 设计文档

## 概述

Vue 3 移动端 Todo List，用于学习 Vue 3 核心概念、Pinia 状态管理和 localStorage 持久化。

## 技术栈

- Vue 3 + Vite
- Pinia（状态管理）
- 原生 CSS（移动端手写样式）
- localStorage（数据持久化）

## 功能列表

- 添加 Todo（多行文本输入，Enter = 换行）
- 勾选完成 / 取消完成（通过优先级色点选择器操作，无确认弹窗）
- 双击编辑内容（textarea，Enter = 换行，Blur = 提交，Esc = 取消）
- 删除（带确认弹窗）
- 按状态筛选：未完成 / 已完成 / 全部（默认打开"未完成"）
- 优先级标记（4 级，彩色圆点）
- i18n：中文 / English
- 侧边菜单（点击 app icon 打开）：导出 JSON、导入 JSON、语言切换、关于
- 刷新页面数据不丢失

## 文件结构

```
src/
├── main.js
├── App.vue
├── stores/
│   ├── todos.js
│   └── locale.js
├── components/
│   ├── TodoInput.vue
│   ├── TodoFilter.vue
│   ├── TodoList.vue
│   ├── PriorityDot.vue
│   └── SideMenu.vue
└── style.css
```

## 数据结构

```js
// 单条 todo
{
  id: string,                                    // UUID 或时间戳+随机数降级
  text: string,
  status: 'active' | 'done',
  priority: 'none' | 'normal' | 'important' | 'urgent'
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
| 旧格式 `done: boolean` | → `status: 'done'/'active'`，`priority: 'none'` |
| 已有 `status`，缺少 `priority` | → 补充 `priority: 'none'` |
| 结构完整 | → 不变 |

## 优先级系统

| 值 | 中文 | 英文 | 颜色 |
|---|---|---|---|
| `none` | 无 | None | `#d1d5db`（灰，空心） |
| `normal` | 普通 | Normal | `#3b82f6`（蓝） |
| `important` | 重要 | Important | `#f59e0b`（橙） |
| `urgent` | 紧急 | Urgent | `#ef4444`（红） |

CSS 变量：

```css
--priority-none:      #d1d5db;
--priority-normal:    #3b82f6;
--priority-important: #f59e0b;
--priority-urgent:    #ef4444;
```

**交互**：点击 todo 左侧圆点 → 弹出选择器（`position: fixed`，坐标由 `getBoundingClientRect()` 计算）→ 上方 4 个优先级选项，下方分隔线 + "完成 / 撤销完成"按钮；点击选择器外部自动关闭。点击"完成"直接切换状态，无确认弹窗。

**视觉**：圆点 14×14px，`none` 为灰色空心，其余实心；已完成状态在圆点中心叠加白色 ✓（`none` 优先级用灰色 ✓）。

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
- 每项：`<PriorityDot>`、文字（单行截断，超出省略；双击编辑）、删除按钮

### `PriorityDot.vue`
- props：`priority: string`，`done: boolean`；emits：`update:priority`，`toggle:done`
- 内部状态 `open` 控制选择器显示
- 选择器用 `position: fixed` 避免父容器 overflow 裁剪
- unmount 时清除 document 点击监听

### `SideMenu.vue`
- `<Teleport to="body">` 侧边抽屉
- 菜单项：导出、导入（隐藏 file input）、语言（→ 右侧子面板）、关于（→ 居中弹窗）

## Pinia Store

### `stores/todos.js`

```js
state:   { todos, filter }
getters: { filteredTodos }
actions: { addTodo, toggleTodo, editTodo, deleteTodo, setFilter, setPriority, exportTodos, importTodos }
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

`t` 包含：`placeholder, add, filters, empty, confirmDelete, exportData, importData, importError, language, about, close, aboutDesc, markDone, markUndone`，以及 4 条优先级标签文本。

## 移动端注意事项

- `touch-action: manipulation`：防止双击缩放
- `@media (hover: hover)`：hover 样式仅在支持 hover 的设备生效，防止移动端触摸后 hover 残留
- IME 输入：按钮不用 `:disabled`，用 CSS `.empty` 类控制外观（v-model 在输入法组合期间不更新）
