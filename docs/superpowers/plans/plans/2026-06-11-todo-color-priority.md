# Todo 颜色优先级标记 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为每个 todo 条目添加 4 级重要程度标记，通过彩色圆点展示，点击圆点弹出色盘来设置优先级。

**Architecture:** 新增独立的 `PriorityDot.vue` 组件，封装圆点展示和色盘弹出逻辑；通过 Teleport 将弹出层渲染到 body，避免父容器 overflow 裁剪；Pinia store 增加 `priority` 字段和 `setPriority` 方法。

**Tech Stack:** Vue 3 `<script setup>`，Pinia，CSS custom properties，`position: fixed` + `getBoundingClientRect()`

---

## File Map

| 操作 | 文件 | 内容 |
|---|---|---|
| Modify | `src/style.css` | 新增 4 个 priority CSS 变量 |
| Modify | `src/stores/locale.js` | 新增 4 条优先级标签文本（中英） |
| Modify | `src/stores/todos.js` | 新增 priority 字段、迁移逻辑、setPriority 方法 |
| Create | `src/components/PriorityDot.vue` | 圆点 + 色盘弹出组件 |
| Modify | `src/components/TodoList.vue` | 集成 PriorityDot |

---

## Task 1: 添加 Priority CSS 变量

**Files:**
- Modify: `src/style.css`

- [ ] **Step 1: 在 `:root` 块末尾追加 4 个变量**

在 `style.css` 第 28 行（`--accent-border` 后），`}` 前插入：

```css
  --priority-none:      #d1d5db;
  --priority-normal:    #3b82f6;
  --priority-important: #f59e0b;
  --priority-urgent:    #ef4444;
```

完整 `:root` 块变为：

```css
:root {
  --text: #6b6375;
  --text-h: #08060d;
  --bg: #fff;
  --border: #e5e4e7;
  --accent: #aa3bff;
  --accent-bg: rgba(170, 59, 255, 0.1);
  --accent-border: rgba(170, 59, 255, 0.5);
  --priority-none:      #d1d5db;
  --priority-normal:    #3b82f6;
  --priority-important: #f59e0b;
  --priority-urgent:    #ef4444;

  font-family: system-ui, 'Segoe UI', Roboto, sans-serif;
  color: var(--text);
  background: var(--bg);
  -webkit-font-smoothing: antialiased;
}
```

- [ ] **Step 2: 验证变量语法无误**

```bash
cd /home/appuser/workspace/app02.git/todo && npm run build 2>&1 | tail -5
```

期望：无报错，输出 `built in X.Xs`

- [ ] **Step 3: Commit**

```bash
git add src/style.css
git commit -m "feat: add priority color CSS variables"
```

---

## Task 2: 添加 i18n 优先级标签

**Files:**
- Modify: `src/stores/locale.js`

- [ ] **Step 1: 在 zh 对象末尾（`aboutDesc` 后）添加标签**

```js
// zh 对象中新增（在 aboutDesc 后，逗号分隔）：
priorityNone:      '无',
priorityNormal:    '普通',
priorityImportant: '重要',
priorityUrgent:    '紧急',
```

- [ ] **Step 2: 在 en 对象末尾同样添加**

```js
// en 对象中新增（在 aboutDesc 后）：
priorityNone:      'None',
priorityNormal:    'Normal',
priorityImportant: 'Important',
priorityUrgent:    'Urgent',
```

修改后 `locale.js` 中两个对象末尾各长这样：

```js
// zh
    about: '关于',
    close: '关闭',
    aboutDesc: '一个简洁的移动端待办应用',
    priorityNone:      '无',
    priorityNormal:    '普通',
    priorityImportant: '重要',
    priorityUrgent:    '紧急',
  },
```

```js
// en
    about: 'About',
    close: 'Close',
    aboutDesc: 'A minimal mobile todo app',
    priorityNone:      'None',
    priorityNormal:    'Normal',
    priorityImportant: 'Important',
    priorityUrgent:    'Urgent',
  },
```

- [ ] **Step 3: 验证构建**

```bash
cd /home/appuser/workspace/app02.git/todo && npm run build 2>&1 | tail -5
```

期望：无报错

- [ ] **Step 4: Commit**

```bash
git add src/stores/locale.js
git commit -m "feat: add priority label i18n strings"
```

---

## Task 3: 更新 Todos Store

**Files:**
- Modify: `src/stores/todos.js`

- [ ] **Step 1: 修改迁移逻辑，补全 priority 字段**

将第 6-11 行（`const raw` 和 `const todos`）替换为：

```js
  const raw = JSON.parse(localStorage.getItem('todos') || '[]')
  const todos = ref(raw.map(t => {
    let migrated = t
    // 旧格式迁移：done: boolean → status
    if ('done' in t && !('status' in t)) {
      migrated = { id: t.id, text: t.text, status: t.done ? 'done' : 'active' }
    }
    // 补全 priority 字段
    if (!('priority' in migrated)) {
      migrated = { ...migrated, priority: 'none' }
    }
    return migrated
  }))
```

- [ ] **Step 2: 修改 addTodo，默认 priority 为 'none'**

将第 24-31 行的 `addTodo` 函数替换为：

```js
  function addTodo(text) {
    const id = window.isSecureContext
      ? crypto.randomUUID()
      : Date.now().toString(36) + Math.random().toString(36).slice(2)
    todos.value.push({ id, text, status: 'active', priority: 'none' })
  }
```

- [ ] **Step 3: 在 deleteTodo 后新增 setPriority 方法**

在 `function deleteTodo` 块（第 43-45 行）之后插入：

```js
  function setPriority(id, priority) {
    const todo = todos.value.find(t => t.id === id)
    if (todo) todo.priority = priority
  }
```

- [ ] **Step 4: 将 setPriority 加入 return 列表**

将第 101 行的 return 语句改为：

```js
  return { todos, filter, filteredTodos, addTodo, toggleTodo, editTodo, deleteTodo, setPriority, setFilter, exportTodos, importTodos }
```

- [ ] **Step 5: 验证构建**

```bash
cd /home/appuser/workspace/app02.git/todo && npm run build 2>&1 | tail -5
```

期望：无报错

- [ ] **Step 6: Commit**

```bash
git add src/stores/todos.js
git commit -m "feat: add priority field and setPriority to todos store"
```

---

## Task 4: 创建 PriorityDot.vue

**Files:**
- Create: `src/components/PriorityDot.vue`

- [ ] **Step 1: 新建文件，写入完整组件**

```vue
<script setup>
import { ref, computed, onUnmounted } from 'vue'
import { useLocaleStore } from '../stores/locale'

const props = defineProps({
  priority: { type: String, default: 'none' }
})
const emit = defineEmits(['update:priority'])

const locale = useLocaleStore()
const open = ref(false)
const dotRef = ref(null)
const pickerPos = ref({ top: 0, left: 0 })

const OPTIONS = ['none', 'normal', 'important', 'urgent']

const labels = computed(() => ({
  none:      locale.t.priorityNone,
  normal:    locale.t.priorityNormal,
  important: locale.t.priorityImportant,
  urgent:    locale.t.priorityUrgent,
}))

function openPicker(e) {
  e.stopPropagation()
  const rect = dotRef.value.getBoundingClientRect()
  pickerPos.value = { top: rect.bottom + 6, left: rect.left }
  open.value = true
}

function choose(val, e) {
  e.stopPropagation()
  emit('update:priority', val)
  open.value = false
}

function close() {
  open.value = false
}

document.addEventListener('click', close)
onUnmounted(() => document.removeEventListener('click', close))
</script>

<template>
  <button
    ref="dotRef"
    class="pdot"
    :class="`pdot--${priority}`"
    type="button"
    @click="openPicker"
  />
  <Teleport to="body">
    <div
      v-if="open"
      class="pdot-picker"
      :style="{ top: pickerPos.top + 'px', left: pickerPos.left + 'px' }"
      @click.stop
    >
      <button
        v-for="opt in OPTIONS"
        :key="opt"
        class="pdot-option"
        :class="{ 'pdot-option--active': opt === priority }"
        type="button"
        @click="choose(opt, $event)"
      >
        <span class="pdot" :class="`pdot--${opt}`" />
        <span>{{ labels[opt] }}</span>
      </button>
    </div>
  </Teleport>
</template>

<style scoped>
.pdot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  flex-shrink: 0;
  display: block;
  padding: 0;
  cursor: pointer;
  border: 2px solid var(--priority-none);
  background: transparent;
}

.pdot--none      { border: 2px solid var(--priority-none); background: transparent; }
.pdot--normal    { border: none; background: var(--priority-normal); }
.pdot--important { border: none; background: var(--priority-important); }
.pdot--urgent    { border: none; background: var(--priority-urgent); }

/* picker 弹出层（Teleport 内仍保留 scoped 属性，无需 :global）*/
.pdot-picker {
  position: fixed;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.14);
  padding: 4px;
  display: flex;
  flex-direction: column;
  z-index: 300;
  min-width: 110px;
}

.pdot-option {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border: none;
  background: transparent;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  color: var(--text-h);
  white-space: nowrap;
  width: 100%;
  text-align: left;
}

.pdot-option--active {
  background: var(--accent-bg);
}

@media (hover: hover) {
  .pdot-option:hover {
    background: var(--accent-bg);
  }
}
</style>
```

- [ ] **Step 2: 验证构建**

```bash
cd /home/appuser/workspace/app02.git/todo && npm run build 2>&1 | tail -5
```

期望：无报错

- [ ] **Step 3: Commit**

```bash
git add src/components/PriorityDot.vue
git commit -m "feat: add PriorityDot component with color picker"
```

---

## Task 5: 集成 PriorityDot 到 TodoList.vue

**Files:**
- Modify: `src/components/TodoList.vue`

- [ ] **Step 1: 在 `<script setup>` 中 import PriorityDot**

在第 2 行（`import { ref, nextTick } from 'vue'` 下方）插入：

```js
import PriorityDot from './PriorityDot.vue'
```

- [ ] **Step 2: 在 `<li>` 的 `<input>` 前插入 PriorityDot**

将第 53-76 行的 `<li>` 块替换为：

```html
    <li
      v-for="todo in store.filteredTodos"
      :key="todo.id"
      :class="{ done: todo.status === 'done' }"
    >
      <PriorityDot
        :priority="todo.priority || 'none'"
        @update:priority="store.setPriority(todo.id, $event)"
      />
      <input
        type="checkbox"
        :checked="todo.status === 'done'"
        @click.prevent="confirmToggle(todo)"
      />
      <span v-if="editingId !== todo.id" @dblclick="startEdit(todo)">
        {{ todo.text }}
      </span>
      <textarea
        v-else
        v-model="editingText"
        class="edit-textarea"
        @keyup.escape="cancelEdit"
        @blur="commitEdit(todo.id)"
        @input="resizeTextarea"
      />
      <button class="delete" @click="confirmDelete(todo)">×</button>
    </li>
```

- [ ] **Step 3: 验证构建**

```bash
cd /home/appuser/workspace/app02.git/todo && npm run build 2>&1 | tail -5
```

期望：无报错

- [ ] **Step 4: Commit**

```bash
git add src/components/TodoList.vue
git commit -m "feat: integrate PriorityDot into TodoList"
```

---

## Task 6: 端到端验证

- [ ] **Step 1: 启动开发服务器**

```bash
cd /home/appuser/workspace/app02.git/todo && npm run dev
```

期望：终端显示 `Local: http://localhost:3071/`

- [ ] **Step 2: 逐项检查**

打开 `http://localhost:3071`，依次验证：

1. **新 todo 圆点默认灰色** — 添加任意 todo，左侧显示空心灰圆
2. **点击圆点弹出色盘** — 色盘显示 4 个选项，每项有圆点 + 文字标签
3. **选择颜色** — 圆点变为对应颜色；当前选中项背景高亮
4. **点击外部关闭** — 点击 todo 条目以外区域，色盘消失
5. **刷新后保持** — 刷新页面，颜色设置仍存在（localStorage 持久化）
6. **done 状态** — 勾选 todo 后，圆点随整体变淡（opacity 0.45）
7. **切换语言** — 打开侧边菜单切换语言，色盘标签从中文变英文（或反向）
8. **旧数据迁移** — 打开 DevTools → Application → localStorage，手动插入一条无 `priority` 字段的 todo，刷新后显示灰色圆点

- [ ] **Step 3: 若一切正常，停止服务器**

`Ctrl+C`
