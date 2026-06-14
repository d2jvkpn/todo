# Design: Drag-to-Reorder & Subtasks

Date: 2026-06-14

## Overview

Two features added together:
1. Replace swipe-↑ button with long-press drag-to-reorder
2. Subtasks managed via a bottom-sheet detail page

---

## Feature 1: Drag-to-Reorder

### Interaction

- Long-press any todo row for 400ms → enter drag mode (`delayOnTouchOnly: true`; mouse drags immediately)
- Dragging row gets visual lift: `box-shadow` elevation + slight `opacity` reduction
- Other rows animate smoothly out of the way (`animation: 200ms` via SortableJS)
- Release to drop; underlying `todos[]` order updates and persists to localStorage

### Conflict with swipe gesture

- On `touchstart` that becomes a long-press, any open swipe-reveal row closes first
- Short horizontal swipes still trigger swipe-reveal (SortableJS distinguishes by distance/time)

### Swipe-reveal changes

- ↑ button removed; `REVEAL_W` 140 → 70px; only ✕ delete button remains
- `onMoveUp` and related constants removed from `TodoList.vue`

### Sort scope

- Drag reorders within the currently active filter view
- `reorderInView(fromIndex, toIndex, filteredIds)` store action splices the moved item to the correct position in `todos[]`

### Implementation

```
npm install vue-draggable-plus
```

`TodoList.vue`: wrap `<ul>` with `<VueDraggable>`, bind `@end` to call `store.reorderInView(...)`.

---

## Feature 2: Subtasks

### Data structure

```js
// Subtask item
{ id: string, text: string, done: boolean }

// Updated todo item
{
  id, text, status, priority,
  subtasks: SubtaskItem[]   // new field; migrated as [] for existing todos
}
```

### Entry point

Single tap on todo text → open `TodoDetail.vue` bottom sheet.  
Inline double-tap editing removed; text editing happens inside the detail page.

### Bottom sheet (`TodoDetail.vue`)

- Position: `fixed`, slides in from bottom (`transform: translateY`), backdrop overlay
- Height: `70vh`
- Dismiss: drag handle downward, or tap backdrop
- Layout top to bottom:
  1. Drag handle bar (decorative)
  2. Editable parent task textarea (blur → save via `store.editTodo`)
  3. Subtask list — each row: checkbox + text + × delete button
  4. Add-subtask input row at bottom — Enter or ✓ button to confirm

### Progress indicator

When a todo has ≥1 subtask, display `done/total` badge next to the ✓ button in the list row (e.g. `2/3`). Hidden when `subtasks` is empty.

### Auto-complete

`toggleSubtask` action: after marking a subtask done, if all subtasks are `done === true`, call `toggleTodo(parentId)` silently (no confirmation dialog). The parent moves to `done` immediately.

Reverse: unchecking a subtask when parent is `done` does NOT auto-revert the parent.

---

## Store changes (`stores/todos.js`)

### New actions

```js
addSubtask(todoId, text)           // push { id, text, done: false }
toggleSubtask(todoId, subtaskId)   // flip done; auto-complete parent if all done
deleteSubtask(todoId, subtaskId)   // filter out
reorderInView(fromIndex, toIndex, filteredIds)  // splice in todos[]
```

### Migration

```js
if (!('subtasks' in migrated)) migrated = { ...migrated, subtasks: [] }
```

---

## Component changes

| Component | Change |
|---|---|
| `TodoList.vue` | Add `<VueDraggable>`; remove inline edit state + ↑ button; single-tap text → emit open detail; add progress badge; `REVEAL_W` 140→70 |
| `TodoDetail.vue` | New component: bottom sheet with parent edit + subtask CRUD |
| `stores/todos.js` | New actions + migration |
| `docs/Design.md` | Sync feature list, interaction model, data structure |
| `docs/Architecture.md` | Add `TodoDetail.vue` to component tree |

---

## Out of scope

- Subtask priority or due dates
- Nested subtasks (subtasks of subtasks)
- Drag-to-reorder subtasks within the detail page
- Subtasks visible in the main list without opening detail
