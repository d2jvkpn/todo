# Todo App 设计文档

## 概述

Vue 3 移动端 Todo List，用于学习 Vue 3 核心概念、Pinia 状态管理和 localStorage 持久化。

## 技术栈

- Vue 3 + Vite
- Pinia（状态管理）
- 原生 CSS（移动端手写样式）
- localStorage（数据持久化）
- PWA：`vite-plugin-pwa` + Workbox（离线缓存、可安装）

## 功能列表

- 添加 Todo（多行文本输入，Enter = 换行）
- 勾选完成 / 取消完成（右侧 ✓ 按钮，灰色 → 绿色，点击弹出确认弹窗含 todo 预览文字）
- 双击编辑内容（textarea，Enter = 换行，Blur = 提交，Esc = 取消，双击自动聚焦弹出输入法）
- 左滑操作：露出 ↑（上移一位）和 ✕（删除，带确认弹窗）两个按钮
- 手动排序：左滑后点 ↑ 在当前筛选视图内上移一位（与上一条交换位置）
- 按状态筛选：未完成 / 已完成 / 全部（默认打开"未完成"）
- 优先级标记（4 级，彩色圆点，点击弹出选择器）
- i18n：中文 / English
- 主题切换：跟随系统 / 浅色 / 深色（持久化至 localStorage）
- 侧边菜单（点击 app icon 打开）：导出 JSON、导入 JSON、**清空数据**（带确认弹窗）、检查更新、主题切换、语言切换、关于
- 刷新页面数据不丢失
- PWA：可安装到主屏，离线可用（Workbox 预缓存静态资产 + Cache API 缓存运行时配置）

## 文件结构

```
src/
├── main.js
├── App.vue
├── stores/
│   ├── todos.js
│   ├── locale.js
│   └── theme.js
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

**交互**：点击 todo 左侧圆点 → 弹出选择器（`position: fixed`，坐标由 `getBoundingClientRect()` 计算）→ 4 个优先级选项；点击选择器外部自动关闭。

**视觉**：圆点 20×20px，点击热区扩展至 40×40px（`::before` 伪元素）；`none` 为灰色空心，其余实心。已完成状态不在圆点上叠加 ✓，由右侧绿色 ✓ 按钮体现。

## Todo Item 交互

### 普通状态

```
[优先级圆点] [文字（flex:1，支持多行 pre-wrap）] [✓ 完成按钮] [× 删除（仅鼠标设备）]
```

- ✓ 按钮：灰色（未完成）/ 绿色（已完成），点击弹出含 todo 预览文字的确认弹窗
- × 按钮：`@media (pointer: coarse)` 下隐藏，鼠标设备 hover 显示

### 左滑展开状态

```
[优先级圆点] [文字] [✓]   ← 内容层左移 140px →   [↑ 70px] [✕ 70px]
```

- 内容层：`.item-content`，`transform: translateX()` 滑动
- 操作层：`.swipe-actions`，`position: absolute; right: 0`，两个等宽按钮
  - ↑（灰色）：当前筛选视图内上移一位，操作后自动关闭滑出
  - ✕（红色）：触发删除确认弹窗
- 滑动阈值 48px：超过吸附展开，不足弹回
- 同一时刻只有一个条目展开；触摸其他位置、点击其他条目均自动关闭

### 编辑状态（双击进入）

- 文字替换为 `<textarea>`，自动聚焦、弹出输入法
- Enter = 换行，Esc = 取消，Blur = 提交保存
- 触摸列表外任意位置 → 立即提交并退出编辑

## 组件职责

### `App.vue`
根组件，固定头部（`.app-header`）+ 可滚动内容区（`.app-body`）。头部包含 app icon（点击打开侧边菜单）、标题、日期（格式 `MM-DD Www`，如 `06-13 Sat`）、TodoInput、TodoFilter。

### `TodoInput.vue`
- `<textarea>` 多行输入，Enter = 换行
- 聚焦或有内容时显示添加按钮；`@mousedown.prevent` 防止点击按钮时 textarea 失焦（保证桌面端 add 正常提交）
- 添加按钮为空时使用 `.empty` class 降低透明度（不用 `:disabled` 避免 IME 问题）

### `TodoFilter.vue`
- 三个按钮：未完成 / 已完成 / 全部
- 调用 `store.setFilter(value)`

### `TodoList.vue`
- 渲染 `store.filteredTodos`
- 每项结构：`.swipe-wrap`（overflow:hidden 裁剪容器）→ `.item-content`（滑动层）+ `.swipe-actions`（操作层）
- 管理左滑手势状态（`swipeOffsets`、`openId`、`draggingId`）
- 管理内联编辑状态（`editingId`、`editingText`）
- 全局 `touchstart` 监听：触摸 `.edit-textarea` 外 → 提交编辑；同时关闭已展开的滑出条目
- 确认弹窗（`modal` ref）复用于：完成切换、删除

### `PriorityDot.vue`
- props：`priority: string`；emits：`update:priority`
- 内部状态 `open` 控制选择器显示
- 选择器内仅含 4 个优先级选项（无"完成"按钮）；标签由组件内 `LABELS` 常量提供（不依赖 locale store）
- 选择器用 `position: fixed` 避免父容器 overflow 裁剪
- unmount 时清除 document 点击监听

### `SideMenu.vue`
- `<Teleport to="body">` 侧边抽屉
- 菜单项（顺序）：导出、导入（隐藏 file input）、**清空数据**（红色 danger 样式，带确认弹窗）、检查更新、分隔线、主题（→ 右侧子面板，三选一）、语言（→ 右侧子面板）、关于（→ 居中弹窗）
- 主题与语言子面板互斥，点击抽屉空白处同时关闭
- "检查更新"：调用 `window.todoCheckForUpdates()`，检查中禁用按钮；结果用共享 alert 弹窗展示
- 关于弹窗展示 `techs`、`version`、`repository`（可点击链接）以及配置缓存时间

## Pinia Store

### `stores/todos.js`

```js
state:   { todos, filter }
getters: { filteredTodos }
actions: { addTodo, toggleTodo, editTodo, deleteTodo, clearAll, setPriority, moveUp, setFilter, exportTodos, importTodos }
```

- `moveUp(id)`：在 `filteredTodos` 中找到前一个条目，交换二者在 `todos[]` 中的位置
- `clearAll()`：将 `todos[]` 置为空数组

**localStorage 同步**：`watch(todos, ..., { deep: true })`，初始化时迁移旧数据。

**ID 生成**：`window.isSecureContext ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2)`（LAN IP 访问时 crypto.randomUUID() 不可用）。

**导出**：`showSaveFilePicker`（支持时）或降级为 `<a download>`，文件名格式 `TODO.yyyy-mm-dd-timestamp.json`。

**导入**：验证 `id + text + status` 字段存在，导入后覆盖当前数据。

### `stores/locale.js`

```js
state:   { locale: 'zh' | 'en' }  // init: localStorage → navigator.language → 'en'
getters: { t }   // computed(() => messages[locale.value])
```

`t` 包含：`placeholder, add, filters, empty, confirmDelete(p), delete, confirmMarkDone(p), confirmMarkUndone(p), clearData, confirmClearData, exportData, importData, importError, language, about, close, aboutDesc, markDone, markUndone`，4 条优先级标签，关于弹窗字段，主题标签，更新流程文案，`cancel, confirm`。

## 移动端注意事项

- `touch-action: manipulation`：防止双击缩放
- `@media (hover: hover)`：hover 样式仅在支持 hover 的设备生效，防止移动端触摸后 hover 残留
- `@media (pointer: coarse)`：触控设备隐藏 × 删除按钮，改用左滑操作
- IME 输入：按钮不用 `:disabled`，用 CSS `.empty` 类控制外观
- 左滑手势：`touchstart/touchmove/touchend`，`.passive` 修饰符避免阻塞滚动；拖动中禁用 CSS transition，松手后恢复弹性动画
