# 合并优先级选择按钮与完成按钮 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将优先级色点与完成复选框合并为单一控件：点击色点打开选择器，选择器下方新增"完成/撤销完成"按钮，色点本身叠加 ✓ 显示已完成状态。

**Architecture:** 修改 `PriorityDot.vue` 增加 `done` prop 和 `toggle:done` emit；选择器内增加分隔线与完成行；`TodoList.vue` 移除 `<input type="checkbox">` 并将完成切换交给 `PriorityDot`。无确认弹窗。

**Tech Stack:** Vue 3 Composition API, Pinia, CSS scoped

---

## 文件结构

| 文件 | 变更 |
|------|------|
| `src/stores/locale.js` | 新增 `markDone` / `markUndone` 两个 locale key |
| `src/components/PriorityDot.vue` | 新增 prop `done`、emit `toggle:done`、✓ 叠加样式、选择器完成行 |
| `src/components/TodoList.vue` | 移除 `<input type="checkbox">`、`confirmToggle` 函数及复选框 CSS，接入新 prop/event |

---

### Task 1: 在 locale.js 中添加 markDone / markUndone

**Files:**
- Modify: `src/stores/locale.js`

- [ ] **Step 1: 在 zh 语言包末尾（`confirm` 后）添加两个 key**

在 `src/stores/locale.js` 的 `zh` 对象中，找到：
```js
    cancel:  '取消',
    confirm: '确定',
```
替换为：
```js
    cancel:  '取消',
    confirm: '确定',
    markDone:   '完成',
    markUndone: '撤销完成',
```

- [ ] **Step 2: 在 en 语言包做同样修改**

找到：
```js
    cancel:  'Cancel',
    confirm: 'OK',
```
替换为：
```js
    cancel:  'Cancel',
    confirm: 'OK',
    markDone:   'Done',
    markUndone: 'Undo',
```

- [ ] **Step 3: 提交**

```bash
git add src/stores/locale.js
git commit -m "feat: add markDone/markUndone locale keys"
```

---

### Task 2: 更新 PriorityDot — prop、emit、✓ 叠加样式

**Files:**
- Modify: `src/components/PriorityDot.vue`

- [ ] **Step 1: 在 `<script setup>` 中添加 `done` prop 和 `toggle:done` emit**

找到：
```js
const props = defineProps({
  priority: { type: String, default: 'none' }
})
const emit = defineEmits(['update:priority'])
```
替换为：
```js
const props = defineProps({
  priority: { type: String, default: 'none' },
  done: { type: Boolean, default: false }
})
const emit = defineEmits(['update:priority', 'toggle:done'])
```

- [ ] **Step 2: 更新 `openPicker` 中的 `pickerH`**

找到：
```js
  const pickerH = 76  // single row: dot 20px + label 14px + padding
```
替换为：
```js
  const pickerH = 140  // priority row + divider + done row + padding
```

- [ ] **Step 3: 更新模板中色点按钮的 class 绑定**

找到：
```html
    class="pdot"
    :class="`pdot--${priority}`"
```
替换为：
```html
    class="pdot"
    :class="[`pdot--${priority}`, { 'pdot--done': done }]"
```

- [ ] **Step 4: 给 `.pdot` 添加 `position: relative`，并新增 `::after` 伪元素样式**

找到：
```css
.pdot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  flex-shrink: 0;
  display: block;
  padding: 0;
  cursor: pointer;
}
```
替换为：
```css
.pdot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  flex-shrink: 0;
  display: block;
  padding: 0;
  cursor: pointer;
  position: relative;
}

.pdot--done::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 9px;
  line-height: 1;
  color: #fff;
  pointer-events: none;
}

.pdot--none.pdot--done::after {
  color: var(--priority-none);
}
```

- [ ] **Step 5: 提交**

```bash
git add src/components/PriorityDot.vue
git commit -m "feat: add done prop and checkmark overlay to PriorityDot"
```

---

### Task 3: 更新 PriorityDot — 选择器完成行

**Files:**
- Modify: `src/components/PriorityDot.vue`

- [ ] **Step 1: 在 `<script setup>` 中添加 `toggleDone` 函数**

在 `close` 函数之前添加：
```js
function toggleDone(e) {
  e.stopPropagation()
  emit('toggle:done')
  open.value = false
}
```

- [ ] **Step 2: 将选择器主体改为纵向布局，优先级选项包裹在 `.pdot-priority-row` 中**

找到：
```html
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
          <span class="pdot-opt-dot" :class="`pdot--${opt}`" />
          <span class="pdot-opt-label">{{ labels[opt] }}</span>
        </button>
      </div>
```
替换为：
```html
      <div
        v-if="open"
        class="pdot-picker"
        :style="{ top: pickerPos.top + 'px', left: pickerPos.left + 'px' }"
        @click.stop
      >
        <div class="pdot-priority-row">
          <button
            v-for="opt in OPTIONS"
            :key="opt"
            class="pdot-option"
            :class="{ 'pdot-option--active': opt === priority }"
            type="button"
            @click="choose(opt, $event)"
          >
            <span class="pdot-opt-dot" :class="`pdot--${opt}`" />
            <span class="pdot-opt-label">{{ labels[opt] }}</span>
          </button>
        </div>
        <div class="pdot-divider" />
        <button
          class="pdot-done-btn"
          type="button"
          @click="toggleDone"
        >
          {{ done ? locale.t.markUndone : locale.t.markDone }}
        </button>
      </div>
```

- [ ] **Step 3: 更新 `.pdot-picker` 为纵向布局，并添加新元素的 CSS**

找到：
```css
/* picker 弹出层 */
.pdot-picker {
  position: fixed;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 14px;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.16);
  padding: 8px 6px;
  display: flex;
  flex-direction: row;
  gap: 2px;
  z-index: 300;
}
```
替换为：
```css
/* picker 弹出层 */
.pdot-picker {
  position: fixed;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 14px;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.16);
  padding: 8px 6px;
  display: flex;
  flex-direction: column;
  z-index: 300;
}

.pdot-priority-row {
  display: flex;
  flex-direction: row;
  gap: 2px;
}

.pdot-divider {
  height: 1px;
  background: var(--border);
  margin: 4px 4px;
}

.pdot-done-btn {
  border: none;
  background: transparent;
  border-radius: 10px;
  cursor: pointer;
  padding: 8px 12px;
  font-size: 13px;
  color: var(--text-h);
  text-align: center;
  width: 100%;
}
```

- [ ] **Step 4: 在 hover media query 中为 `.pdot-done-btn` 添加 hover 样式**

找到：
```css
@media (hover: hover) {
  .pdot-option:hover {
    background: var(--accent-bg);
  }
  .pdot-option:hover .pdot-opt-dot {
    transform: scale(1.15);
  }
}
```
替换为：
```css
@media (hover: hover) {
  .pdot-option:hover {
    background: var(--accent-bg);
  }
  .pdot-option:hover .pdot-opt-dot {
    transform: scale(1.15);
  }
  .pdot-done-btn:hover {
    background: var(--accent-bg);
  }
}
```

- [ ] **Step 5: 提交**

```bash
git add src/components/PriorityDot.vue
git commit -m "feat: add completion row to PriorityDot picker"
```

---

### Task 4: 更新 TodoList — 移除复选框，接入合并按钮

**Files:**
- Modify: `src/components/TodoList.vue`

- [ ] **Step 1: 移除 `confirmToggle` 函数**

删除整段：
```js
function confirmToggle(todo) {
  const oneline = todo.text.replace(/\s+/g, ' ').trim()
  const preview = oneline.length > 15 ? oneline.slice(0, 15) + '…' : oneline
  const msg = todo.status === 'done' ? locale.t.confirmUndone(preview) : locale.t.confirmDone(preview)
  showConfirm(msg, () => store.toggleTodo(todo.id))
}
```

- [ ] **Step 2: 在模板中移除复选框，向 PriorityDot 传入 `done` prop 并监听 `toggle:done`**

找到：
```html
      <PriorityDot
        :priority="todo.priority || 'none'"
        @update:priority="store.setPriority(todo.id, $event)"
      />
      <input
        type="checkbox"
        :checked="todo.status === 'done'"
        @click.prevent="confirmToggle(todo)"
      />
```
替换为：
```html
      <PriorityDot
        :priority="todo.priority || 'none'"
        :done="todo.status === 'done'"
        @update:priority="store.setPriority(todo.id, $event)"
        @toggle:done="store.toggleTodo(todo.id)"
      />
```

- [ ] **Step 3: 移除复选框 CSS**

删除整段：
```css
.todo-list li input[type="checkbox"] {
  width: 20px;
  height: 20px;
  accent-color: var(--accent);
  flex-shrink: 0;
  cursor: pointer;
}
```

- [ ] **Step 4: 提交**

```bash
git add src/components/TodoList.vue
git commit -m "feat: replace checkbox with PriorityDot merged button in TodoList"
```

---

### Task 5: 手动验证

**Files:** 无代码变更

- [ ] **Step 1: 启动开发服务器**

```bash
npm run dev
```

在浏览器中打开输出的本地地址（默认 `http://localhost:5173`）。

- [ ] **Step 2: 验证以下场景**

| 场景 | 预期结果 |
|------|----------|
| 点击优先级色点 | 弹出选择器，上方 4 个优先级，下方分隔线 + "完成"按钮 |
| 点击"完成" | 弹窗关闭，色点叠加 ✓，文字出现删除线 |
| 再次点击色点 | 选择器下方显示"撤销完成" |
| 点击"撤销完成" | 恢复未完成状态，✓ 消失 |
| 切换优先级 | 色点颜色更新，完成状态不变 |
| 已完成项切换优先级 | ✓ 保持显示，颜色随优先级变化 |
| 切换语言为英文 | 按钮显示"Done"/"Undo" |
| 复选框 | 不再出现（已移除） |

- [ ] **Step 3: 无异常后即完成，无需额外提交**
