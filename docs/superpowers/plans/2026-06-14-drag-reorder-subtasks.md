# Drag-to-Reorder & Subtasks Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace swipe-↑ with long-press drag-to-reorder, and add per-todo subtasks managed via a bottom-sheet detail page.

**Architecture:** `vue-draggable-plus` (SortableJS) wraps the todo `<ul>` in `TodoList.vue`; a local `dragList` ref mirrors `store.filteredTodos` and is synced back on drag-end via a new `reorderTodosByIds` store action. A new `TodoDetail.vue` bottom sheet opens on single-tap of todo text; it hosts parent-text editing and subtask CRUD. The store gains four new actions; `moveUp` is removed.

**Tech Stack:** Vue 3 `<script setup>`, Pinia, vue-draggable-plus (SortableJS wrapper), native CSS transitions, localStorage.

---

## File map

| Path | Action |
|------|--------|
| `package.json` | Add `vue-draggable-plus` |
| `src/stores/todos.js` | Migration + 4 new actions, remove `moveUp` |
| `src/components/TodoList.vue` | VueDraggable, remove inline-edit, progress badge, tap handler |
| `src/components/TodoDetail.vue` | **Create** — bottom sheet |
| `docs/Design.md` | Sync feature list, data structure, interaction model |
| `docs/Architecture.md` | Update component tree and store description |

---

## Task 1 — Install vue-draggable-plus

**Files:** `package.json`, `package-lock.json`

- [ ] **Step 1: Install**
```bash
npm install vue-draggable-plus
```
Expected: `package.json` dependencies gains `"vue-draggable-plus": "..."`.

- [ ] **Step 2: Verify build still passes**
```bash
npm run build
```
Expected: build writes to `target/dist/` with no errors.

- [ ] **Step 3: Commit**
```bash
git add package.json package-lock.json
git commit -m "chore: add vue-draggable-plus dependency"
```

---

## Task 2 — Store: subtask migration + addSubtask + deleteSubtask

**Files:** `src/stores/todos.js`

- [ ] **Step 1: Add subtasks migration**

In `todos.js`, inside the `.map()` callback, after the priority migration block (after line ~17), add:

```js
    // complement subtasks field
    if (!('subtasks' in migrated)) {
      migrated = { ...migrated, subtasks: [] }
    }
```

- [ ] **Step 2: Add addSubtask and deleteSubtask after setPriority**

After the `setPriority` function, add:

```js
  function addSubtask(todoId, text) {
    const todo = todos.value.find(t => t.id === todoId)
    if (!todo) return
    const id = window.isSecureContext
      ? crypto.randomUUID()
      : Date.now().toString(36) + Math.random().toString(36).slice(2)
    todo.subtasks.push({ id, text, done: false })
  }

  function deleteSubtask(todoId, subtaskId) {
    const todo = todos.value.find(t => t.id === todoId)
    if (!todo) return
    todo.subtasks = todo.subtasks.filter(s => s.id !== subtaskId)
  }
```

- [ ] **Step 3: Add to return object**

Update the return statement to include the two new actions (keep `moveUp` for now):

```js
  return { todos, filter, filteredTodos, addTodo, toggleTodo, editTodo, deleteTodo, clearAll, setPriority, moveUp, setFilter, exportTodos, importTodos, addSubtask, deleteSubtask }
```

- [ ] **Step 4: Verify**
```bash
npm run build
```
Expected: no errors.

- [ ] **Step 5: Commit**
```bash
git add src/stores/todos.js
git commit -m "feat: store — subtask data migration, addSubtask, deleteSubtask"
```

---

## Task 3 — Store: toggleSubtask with auto-complete

**Files:** `src/stores/todos.js`

- [ ] **Step 1: Add toggleSubtask after deleteSubtask**

```js
  function toggleSubtask(todoId, subtaskId) {
    const todo = todos.value.find(t => t.id === todoId)
    if (!todo) return
    const sub = todo.subtasks.find(s => s.id === subtaskId)
    if (!sub) return
    sub.done = !sub.done
    if (
      todo.status === 'active' &&
      todo.subtasks.length > 0 &&
      todo.subtasks.every(s => s.done)
    ) {
      toggleTodo(todoId)
    }
  }
```

- [ ] **Step 2: Add to return object**

```js
  return { todos, filter, filteredTodos, addTodo, toggleTodo, editTodo, deleteTodo, clearAll, setPriority, moveUp, setFilter, exportTodos, importTodos, addSubtask, toggleSubtask, deleteSubtask }
```

- [ ] **Step 3: Commit**
```bash
git add src/stores/todos.js
git commit -m "feat: store — toggleSubtask, auto-complete parent when all subtasks done"
```

---

## Task 4 — Store: reorderTodosByIds, remove moveUp

**Files:** `src/stores/todos.js`

- [ ] **Step 1: Add reorderTodosByIds after toggleSubtask**

```js
  function reorderTodosByIds(orderedFilteredIds) {
    // Find the slots (indices in todos[]) currently occupied by the filtered items
    const positions = orderedFilteredIds.map(id => todos.value.findIndex(t => t.id === id))
    const slots = [...positions].sort((a, b) => a - b)
    const newTodos = [...todos.value]
    orderedFilteredIds.forEach((id, i) => {
      newTodos[slots[i]] = todos.value.find(t => t.id === id)
    })
    todos.value = newTodos
  }
```

- [ ] **Step 2: Delete the moveUp function**

Remove the entire `moveUp` function (currently lines 58–66):
```js
// DELETE this entire block:
  function moveUp(id) {
    const filtered = filteredTodos.value
    const fi = filtered.findIndex(t => t.id === id)
    if (fi <= 0) return
    const prevId = filtered[fi - 1].id
    const ai = todos.value.findIndex(t => t.id === id)
    const bi = todos.value.findIndex(t => t.id === prevId)
    ;[todos.value[ai], todos.value[bi]] = [todos.value[bi], todos.value[ai]]
  }
```

- [ ] **Step 3: Update return object (remove moveUp, add reorderTodosByIds)**

```js
  return { todos, filter, filteredTodos, addTodo, toggleTodo, editTodo, deleteTodo, clearAll, setPriority, setFilter, exportTodos, importTodos, addSubtask, toggleSubtask, deleteSubtask, reorderTodosByIds }
```

- [ ] **Step 4: Verify**
```bash
npm run build
```
Expected: build succeeds. (`TodoList.vue` still has `onMoveUp` referencing `store.moveUp` — runtime error only if the button is clicked, which will be removed in Task 5.)

- [ ] **Step 5: Commit**
```bash
git add src/stores/todos.js
git commit -m "feat: store — reorderTodosByIds, remove moveUp"
```

---

## Task 5 — TodoList: VueDraggable + remove swipe-up button

**Files:** `src/components/TodoList.vue`

- [ ] **Step 1: Update script imports — add watch and VueDraggable**

Replace line 1–5 (the imports block):
```js
import { ref, reactive, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { VueDraggable } from 'vue-draggable-plus'
import { useTodosStore } from '../stores/todos'
import { useLocaleStore } from '../stores/locale'
import PriorityDot from './PriorityDot.vue'
```

(`nextTick` stays for now — still used by `startEdit`; removed in Task 6.)

- [ ] **Step 2: Change REVEAL_W from 140 to 70**

```js
const REVEAL_W = 70      // px — delete button only
```

- [ ] **Step 3: Remove onMoveUp function**

Delete the `onMoveUp` function entirely:
```js
// DELETE:
function onMoveUp(id) {
  store.moveUp(id)
  swipeOffsets[id] = 0
  openId.value = null
}
```

- [ ] **Step 4: Add dragList ref, sync watcher, onDragEnd**

After the `onSwipeDelete` function, add:
```js
// ── drag-to-reorder ─────────────────────────────────────────────────────────
const dragList = ref([])

watch(() => store.filteredTodos, (val) => {
  dragList.value = [...val]
}, { immediate: true })

function onDragEnd() {
  store.reorderTodosByIds(dragList.value.map(t => t.id))
}
```

- [ ] **Step 5: Replace template list with VueDraggable**

Replace the entire `<ul class="todo-list">…</ul>` block with:

```vue
    <ul v-if="dragList.length === 0" class="todo-list">
      <li class="empty">{{ locale.t.empty }}</li>
    </ul>
    <VueDraggable
      v-else
      v-model="dragList"
      tag="ul"
      class="todo-list"
      :animation="200"
      :delay="400"
      :delay-on-touch-only="true"
      :touch-start-threshold="5"
      ghost-class="drag-ghost"
      @end="onDragEnd"
    >
      <li
        v-for="todo in dragList"
        :key="todo.id"
        class="swipe-wrap"
        :class="{ done: todo.status === 'done', dragging: draggingId === todo.id }"
        @touchstart.passive="onTouchStart($event, todo.id)"
        @touchmove.passive="onTouchMove($event, todo.id)"
        @touchend="onTouchEnd(todo.id)"
      >
        <div
          class="item-content"
          :style="{ transform: `translateX(${getOffset(todo.id)}px)` }"
        >
          <PriorityDot
            :priority="todo.priority || 'none'"
            @update:priority="store.setPriority(todo.id, $event)"
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
          <button
            class="done-btn"
            :class="{ 'done-btn--done': todo.status === 'done' }"
            @click="confirmToggle(todo)"
          >✓</button>
          <button class="delete" @click="confirmDelete(todo)">×</button>
        </div>
        <div class="swipe-actions">
          <button class="swipe-delete" @click="onSwipeDelete(todo)">✕</button>
        </div>
      </li>
    </VueDraggable>
```

(Inline-edit span/textarea kept as-is; removed in Task 6.)

- [ ] **Step 6: Update CSS — remove swipe-up styles, add drag-ghost**

Remove these CSS rules:
```css
/* DELETE: */
.swipe-up,
.swipe-delete {
  width: 70px;
  color: #fff;
  border: none;
  font-size: 20px;
  cursor: pointer;
}

.swipe-up     { background: var(--text); }
.swipe-delete { background: #ef4444; }

@media (hover: hover) {
  .swipe-up:hover     { filter: brightness(1.15); }
  .swipe-delete:hover { background: #dc2626; }
}
```

Replace with:
```css
.swipe-delete {
  width: 70px;
  height: 100%;
  color: #fff;
  border: none;
  font-size: 20px;
  cursor: pointer;
  background: #ef4444;
}

@media (hover: hover) {
  .swipe-delete:hover { background: #dc2626; }
}

.drag-ghost {
  opacity: 0.35;
  border-radius: 8px;
}
```

- [ ] **Step 7: Verify**
```bash
npm run dev
```
Open `http://localhost:3071`. Verify:
- List renders correctly
- On desktop: immediately drag any row — it reorders
- ↑ button is gone; ✕ left-swipe delete still works
- Inline edit still works (double-tap / double-click)

- [ ] **Step 8: Commit**
```bash
git add src/components/TodoList.vue
git commit -m "feat: TodoList — VueDraggable drag-to-reorder, remove swipe-up"
```

---

## Task 6 — TodoList: remove inline-edit, add tap handler + progress badge

**Files:** `src/components/TodoList.vue`

- [ ] **Step 1: Update vue import — remove nextTick**

```js
import { ref, reactive, watch, onMounted, onUnmounted } from 'vue'
```

- [ ] **Step 2: Remove inline-edit state and functions**

In `<script setup>`, delete:
- `const editingId = ref(null)` and `const editingText = ref('')`
- `function startEdit(todo) { … }`
- `function resizeTextarea(e) { … }`
- `function commitEdit(id) { … }`
- `function cancelEdit() { … }`

- [ ] **Step 3: Clean up onTouchStart — remove editingId branch**

Replace `onTouchStart`:
```js
function onTouchStart(e, id) {
  if (openId.value && openId.value !== id) {
    swipeOffsets[openId.value] = 0
    openId.value = null
  }
  _startX = e.touches[0].clientX
}
```

- [ ] **Step 4: Clean up onDocumentTouch — remove editingId branch**

Replace `onDocumentTouch`:
```js
function onDocumentTouch(e) {
  if (openId.value) {
    if (e.target.closest('.swipe-actions')) return
    swipeOffsets[openId.value] = 0
    openId.value = null
  }
}
```

- [ ] **Step 5: Add selectedTodo ref**

After the drag-reorder section, add:
```js
const selectedTodo = ref(null)
```

- [ ] **Step 6: Update template span — single-tap, remove textarea, add progress badge**

Replace the span + textarea block inside `item-content`:
```vue
          <span @click="selectedTodo = todo">
            {{ todo.text }}
          </span>
          <span
            v-if="todo.subtasks && todo.subtasks.length > 0"
            class="subtask-badge"
          >{{ todo.subtasks.filter(s => s.done).length }}/{{ todo.subtasks.length }}</span>
```

(The `v-if="editingId !== todo.id"` span and `v-else` textarea are both replaced by the single `<span @click>` above.)

- [ ] **Step 7: Add progress badge CSS**

```css
.subtask-badge {
  flex-shrink: 0;
  font-size: 11px;
  color: var(--text);
  opacity: 0.5;
  min-width: 26px;
  text-align: right;
}
```

- [ ] **Step 8: Verify**
```bash
npm run build
```
Expected: no errors.

- [ ] **Step 9: Commit**
```bash
git add src/components/TodoList.vue
git commit -m "feat: TodoList — remove inline-edit, tap opens detail, progress badge"
```

---

## Task 7 — Create TodoDetail.vue

**Files:** `src/components/TodoDetail.vue` *(create)*

- [ ] **Step 1: Create the file**

`src/components/TodoDetail.vue`:

```vue
<script setup>
import { ref, nextTick } from 'vue'
import { useTodosStore } from '../stores/todos'

const props = defineProps({
  todo: { type: Object, required: true }
})
const emit = defineEmits(['close'])

const store = useTodosStore()
const isOpen = ref(false)
const editText = ref(props.todo.text)
const newSubtaskText = ref('')
const subtaskInputRef = ref(null)

nextTick(() => { isOpen.value = true })

function close() {
  isOpen.value = false
  setTimeout(() => emit('close'), 250)
}

function saveText() {
  const t = editText.value.trim()
  if (!t) { editText.value = props.todo.text; return }
  if (t !== props.todo.text) store.editTodo(props.todo.id, t)
}

function addSubtask() {
  const t = newSubtaskText.value.trim()
  if (!t) return
  store.addSubtask(props.todo.id, t)
  newSubtaskText.value = ''
  nextTick(() => subtaskInputRef.value?.focus())
}
</script>

<template>
  <Teleport to="body">
    <div
      class="detail-backdrop"
      :class="{ 'is-open': isOpen }"
      @click.self="close"
    >
      <div class="detail-sheet">
        <div class="detail-handle" />
        <textarea
          v-model="editText"
          class="detail-title"
          rows="2"
          @blur="saveText"
        />
        <ul class="subtask-list">
          <li
            v-for="sub in todo.subtasks"
            :key="sub.id"
            class="subtask-row"
          >
            <input
              type="checkbox"
              :checked="sub.done"
              @change="store.toggleSubtask(todo.id, sub.id)"
            />
            <span :class="{ 'subtask-done': sub.done }">{{ sub.text }}</span>
            <button class="subtask-delete" @click="store.deleteSubtask(todo.id, sub.id)">×</button>
          </li>
        </ul>
        <div class="subtask-add">
          <input
            ref="subtaskInputRef"
            v-model="newSubtaskText"
            class="subtask-input"
            placeholder="添加子任务…"
            @keyup.enter="addSubtask"
          />
          <button class="subtask-confirm" @click="addSubtask">✓</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.detail-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0);
  transition: background 0.25s;
  z-index: 50;
  display: flex;
  align-items: flex-end;
}
.detail-backdrop.is-open {
  background: rgba(0, 0, 0, 0.45);
}

.detail-sheet {
  width: 100%;
  max-height: 70vh;
  background: var(--surface, #fff);
  border-radius: 16px 16px 0 0;
  padding: 12px 16px 32px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow-y: auto;
  transform: translateY(100%);
  transition: transform 0.25s ease;
}
.detail-backdrop.is-open .detail-sheet {
  transform: translateY(0);
}

.detail-handle {
  width: 36px;
  height: 4px;
  background: var(--border, #e5e7eb);
  border-radius: 2px;
  align-self: center;
  flex-shrink: 0;
}

.detail-title {
  width: 100%;
  font-size: 17px;
  font-weight: 500;
  color: var(--text-h);
  background: transparent;
  border: none;
  border-bottom: 1px solid var(--border);
  padding: 4px 0 8px;
  resize: none;
  outline: none;
  font-family: inherit;
  line-height: 1.5;
  overflow: hidden;
  box-sizing: border-box;
}

.subtask-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.subtask-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 7px 4px;
}

.subtask-row input[type="checkbox"] {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  cursor: pointer;
  accent-color: #22c55e;
}

.subtask-row span {
  flex: 1;
  font-size: 15px;
  color: var(--text-h);
  word-break: break-word;
}

.subtask-done {
  opacity: 0.4;
  text-decoration: line-through;
}

.subtask-delete {
  background: transparent;
  border: none;
  color: var(--text);
  font-size: 20px;
  line-height: 1;
  cursor: pointer;
  padding: 0 4px;
  flex-shrink: 0;
  opacity: 0.45;
}

@media (hover: hover) {
  .subtask-delete:hover { opacity: 1; color: #ef4444; }
}

.subtask-add {
  display: flex;
  gap: 8px;
  align-items: center;
  border-top: 1px solid var(--border);
  padding-top: 10px;
  margin-top: auto;
}

.subtask-input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 15px;
  color: var(--text-h);
  outline: none;
  font-family: inherit;
}

.subtask-input::placeholder {
  color: var(--text);
  opacity: 0.45;
}

.subtask-confirm {
  background: transparent;
  border: none;
  color: #22c55e;
  font-size: 20px;
  cursor: pointer;
  padding: 0 4px;
  flex-shrink: 0;
}
</style>
```

- [ ] **Step 2: Commit**
```bash
git add src/components/TodoDetail.vue
git commit -m "feat: add TodoDetail bottom sheet with parent edit and subtask CRUD"
```

---

## Task 8 — Wire TodoDetail into TodoList

**Files:** `src/components/TodoList.vue`

- [ ] **Step 1: Import TodoDetail**

In `<script setup>`, add:
```js
import TodoDetail from './TodoDetail.vue'
```

- [ ] **Step 2: Add TodoDetail to template**

Just before the closing `</template>` tag, add:
```vue
  <TodoDetail
    v-if="selectedTodo"
    :todo="selectedTodo"
    @close="selectedTodo = null"
  />
```

- [ ] **Step 3: Verify end-to-end**
```bash
npm run dev
```
Open `http://localhost:3071`. Check all of the following:

1. **Drag reorder** — long-press (mobile) or instant-drag (desktop) reorders todos; order persists after page reload
2. **Detail page** — tap todo text → bottom sheet slides up with correct text
3. **Edit parent text** — change text in sheet, tap outside field → saved; list updates
4. **Add subtask** — type in bottom input, press Enter → subtask appears in list
5. **Toggle subtask** — check checkbox → strikethrough; uncheck → restores
6. **Auto-complete** — check all subtasks → parent automatically moves to done list
7. **Delete subtask** — tap × → subtask removed
8. **Progress badge** — `0/2`, `1/2`, `2/2` updates in real time on list row
9. **Close sheet** — tap backdrop → sheet slides down, dismissed
10. **Left-swipe delete** — still works, only ✕ button revealed

- [ ] **Step 4: Commit**
```bash
git add src/components/TodoList.vue
git commit -m "feat: wire TodoDetail into TodoList"
```

---

## Task 9 — Update docs

**Files:** `docs/Design.md`, `docs/Architecture.md`

- [ ] **Step 1: Update Design.md — feature list**

In "功能列表":
- Replace `双击编辑内容（textarea，...）` with `点击 todo 文字打开详情页（可编辑标题 + 管理子任务，Blur 保存）`
- Replace `左滑操作：露出 ↑（上移一位）和 ✕（删除，带确认弹窗）两个按钮` with `左滑操作：露出 ✕（删除，带确认弹窗）按钮`
- Remove `手动排序：左滑后点 ↑ 在当前筛选视图内上移一位（与上一条交换位置）`
- Add `拖拽排序：长按 todo 行 400ms 拖拽重排（vue-draggable-plus / SortableJS），在当前筛选视图内排序，持久化到 localStorage`
- Add `子任务：每条 todo 可添加多条子任务；全部子任务完成后父任务自动标为完成；列表行显示 done/total 进度徽章`

- [ ] **Step 2: Update Design.md — data structure**

Replace the todo shape:
```js
{
  id: string,
  text: string,
  status: 'active' | 'done',
  priority: 'none' | 'normal' | 'important' | 'urgent',
  subtasks: Array<{ id: string, text: string, done: boolean }>
}
```

- [ ] **Step 3: Update Design.md — Todo Item 交互**

Under "左滑展开状态": update `内容层左移 140px` → `内容层左移 70px`; remove ↑ button from diagram and description.

Replace the "编辑状态（双击进入）" section with:
```
### 详情页（点击文字进入）

底部抽屉（70vh），进出场动画 0.25s ease。
- 顶部拖拽把手
- 父任务文字（textarea，blur = 保存）
- 子任务列表：checkbox + 文字 + × 删除
- 底部输入行：输入 + Enter/✓ 添加子任务
- 点击遮罩关闭
```

- [ ] **Step 4: Update Design.md — Pinia Store actions**

In `stores/todos.js` actions list:
- Remove `moveUp`
- Add `addSubtask(todoId, text)`, `toggleSubtask(todoId, subtaskId)`, `deleteSubtask(todoId, subtaskId)`, `reorderTodosByIds(orderedFilteredIds)`

- [ ] **Step 5: Update Architecture.md — component tree**

```
App.vue
├── SideMenu.vue
├── header
│   ├── TodoInput.vue
│   └── TodoFilter.vue
└── main
    └── TodoList.vue    # Drag-to-reorder (VueDraggable), swipe-reveal delete, tap-to-open detail
        ├── PriorityDot.vue
        └── TodoDetail.vue  # Bottom sheet: parent text edit + subtask CRUD (Teleport to body)
```

- [ ] **Step 6: Update Architecture.md — store description**

Under `stores/todos.js`:
- Remove `moveUp(id)` description
- Add subtasks shape to **Todo shape**:
  ```js
  subtasks: Array<{ id: string, text: string, done: boolean }>
  ```
- Add `reorderTodosByIds(orderedFilteredIds)`: rebuilds `todos[]` so the filtered items appear in the given order while non-filtered items keep their relative slots.
- Add migration note: missing `subtasks` field is backfilled as `[]`.

- [ ] **Step 7: Commit**
```bash
git add docs/Design.md docs/Architecture.md
git commit -m "docs: sync Design.md and Architecture.md for drag-reorder + subtasks"
```
