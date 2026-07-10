# Swipe Copy to Clipboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a copy button to the swipe-left action area that writes the task title and subtasks (with done state) to the system clipboard, with a 0.8s green flash as feedback.

**Architecture:** All changes are confined to `src/components/TodoList.vue`. `REVEAL_W` expands to 100 px to reveal two side-by-side buttons (copy left, delete right). A `copiedId` ref drives the feedback state; `copyTodo()` builds the clipboard string and calls `navigator.clipboard.writeText()`.

**Tech Stack:** Vue 3 `<script setup>`, no new dependencies.

## Global Constraints

- All changes in `src/components/TodoList.vue` only — no store, locale, or other component changes.
- Clipboard format: task title on line 1, then each subtask as `[x] text` (done) or `[ ] text` (not done).
- Copy button: 50 px wide, left of the existing delete button.
- Feedback: green background + `✓` icon for 800 ms, then swipe row closes.

---

### Task 1: Expand swipe area and add copy button

**Files:**
- Modify: `src/components/TodoList.vue`

**Interfaces:**
- Produces: `copyTodo(todo)` — reads `todo.text` and `todo.subtasks[]`, writes to clipboard, triggers 800 ms visual feedback then closes the swipe row.

- [ ] **Step 1: Increase REVEAL_W to 100**

In `src/components/TodoList.vue`, find the constant at the top of `<script setup>`:

```js
const REVEAL_W = 50       // px — delete button only, 删除按钮的宽度与滑动到底偏移量相同
```

Change to:

```js
const REVEAL_W = 100      // px — copy + delete buttons (50 px each)
```

- [ ] **Step 2: Add copiedId ref and copyTodo function**

After the `openId` ref declaration (around line 43), add:

```js
const copiedId = ref(null)
```

After the `onSwipeDelete` function (around line 81), add:

```js
function copyTodo(todo) {
  const lines = [todo.text]
  for (const s of todo.subtasks) {
    lines.push((s.done ? '[x] ' : '[ ] ') + s.text)
  }
  navigator.clipboard.writeText(lines.join('\n'))
  copiedId.value = todo.id
  setTimeout(() => {
    copiedId.value = null
    swipeOffsets[todo.id] = 0
    openId.value = null
  }, 800)
}
```

- [ ] **Step 3: Add copy button to template**

In the `<template>`, find the `.swipe-actions` div:

```html
<div class="swipe-actions">
  <button class="swipe-delete" @click="onSwipeDelete(todo)">✕</button>
</div>
```

Replace with:

```html
<div class="swipe-actions">
  <button
    class="swipe-copy"
    :class="{ 'swipe-copy--copied': copiedId === todo.id }"
    @click="copyTodo(todo)"
  >{{ copiedId === todo.id ? '✓' : '⎘' }}</button>
  <button class="swipe-delete" @click="onSwipeDelete(todo)">✕</button>
</div>
```

- [ ] **Step 4: Add CSS for the copy button**

In `<style scoped>`, after the `.swipe-delete` block, add:

```css
.swipe-copy {
  width: 50px;
  height: 100%;
  color: #fff;
  border: none;
  font-size: 20px;
  cursor: pointer;
  background: #3b82f6;
  transition: background 0.15s, color 0.15s;
}

.swipe-copy--copied {
  background: #22c55e;
}

@media (hover: hover) {
  .swipe-copy:not(.swipe-copy--copied):hover { background: #2563eb; }
}
```

- [ ] **Step 5: Verify in browser**

Start the dev server:

```bash
npm run dev
```

Open `http://localhost:3071` on a mobile-sized viewport (or DevTools device mode). Swipe a task left — confirm:
1. Both copy (blue `⎘`) and delete (red `✕`) buttons appear side by side.
2. Tap copy → button turns green with `✓` for ~0.8 s → row closes automatically.
3. Paste in any text field → content matches format:
   ```
   Task title
   [x] done subtask
   [ ] undone subtask
   ```
4. Swipe a task with no subtasks → clipboard contains only the title.
5. Delete button still works as before.

- [ ] **Step 6: Commit**

```bash
git add src/components/TodoList.vue
git commit -m "feat: add swipe-left copy-to-clipboard button

Assisted-by: claude:claude-sonnet-4-6"
```
