# Swipe Copy to Clipboard

**Date:** 2026-07-10  
**Status:** Approved

## Overview

Add a "copy" button to the swipe-left action area in `TodoList.vue`. Tapping it copies the task title and all subtasks (with done state) to the system clipboard, with a brief green flash as feedback.

## Layout

`REVEAL_W` expands from 50 to 100 px to accommodate two side-by-side action buttons:

```
[ 📋 copy ][ ✕ delete ]
   50px       50px
```

Copy is on the left, delete on the right (more dangerous action stays at the far edge). Both buttons are revealed simultaneously when the row is swiped open.

## Clipboard Format

```
Task title
[x] completed subtask
[ ] incomplete subtask
```

- First line is always the task title.
- Each subtask follows on its own line: `[x]` if `done === true`, `[ ]` if `done === false`.
- If there are no subtasks, only the title is written.
- Written via `navigator.clipboard.writeText()`.

## Feedback

A `copiedId` ref (string | null) tracks which row is showing the success state.

On tap:
1. Write text to clipboard.
2. Set `copiedId = todo.id` → button shows green background + `✓` icon.
3. After 800 ms: clear `copiedId`, close the swipe row (`swipeOffsets[id] = 0`, `openId = null`).

The copy button uses a conditional CSS class (`.swipe-copy--copied`) toggled by `copiedId === todo.id`.

## Scope

Changes confined to `TodoList.vue` only:
- Increase `REVEAL_W` constant to 100.
- Add `copiedId` ref and `copyTodo(todo)` function.
- Add copy button element in `.swipe-actions` template.
- Add `.swipe-copy` and `.swipe-copy--copied` styles.

No changes to: store, locale, other components.
