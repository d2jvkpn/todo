<script setup>
import { ref, reactive, nextTick, onMounted, onUnmounted } from 'vue'
import { useTodosStore } from '../stores/todos'
import { useLocaleStore } from '../stores/locale'
import PriorityDot from './PriorityDot.vue'

const store = useTodosStore()
const locale = useLocaleStore()
const editingId = ref(null)
const editingText = ref('')

// { msg, onConfirm, danger? }
const modal = ref(null)

function showConfirm(msg, onConfirm, danger = false) {
  modal.value = { msg, onConfirm, danger }
}

function confirmToggle(todo) {
  const oneline = todo.text.replace(/\s+/g, ' ').trim()
  const preview = oneline.length > 15 ? oneline.slice(0, 15) + '…' : oneline
  const msg = todo.status === 'done'
    ? locale.t.confirmMarkUndone(preview)
    : locale.t.confirmMarkDone(preview)
  showConfirm(msg, () => store.toggleTodo(todo.id))
}

function confirmDelete(todo) {
  const oneline = todo.text.replace(/\s+/g, ' ').trim()
  const preview = oneline.length > 15 ? oneline.slice(0, 15) + '…' : oneline
  showConfirm(locale.t.confirmDelete(preview), () => store.deleteTodo(todo.id), true)
}

function startEdit(todo) {
  editingId.value = todo.id
  editingText.value = todo.text
  nextTick(() => {
    const ta = document.querySelector('.edit-textarea')
    if (ta) {
      ta.style.height = 'auto'
      ta.style.height = ta.scrollHeight + 'px'
      ta.focus()
    }
  })
}

function resizeTextarea(e) {
  e.target.style.height = 'auto'
  e.target.style.height = e.target.scrollHeight + 'px'
}

function commitEdit(id) {
  const trimmed = editingText.value.trim()
  if (trimmed) store.editTodo(id, trimmed)
  editingId.value = null
}

function cancelEdit() {
  editingId.value = null
}

// ── swipe-to-reveal delete ──────────────────────────────────────────────────
const REVEAL_W = 140      // px — up button (64) + delete button (76), must match CSS
const SNAP_THRESHOLD = 48 // px — minimum drag distance to snap open

const swipeOffsets = reactive({}) // { [id]: number }
const openId = ref(null)
const draggingId = ref(null)
let _startX = 0

function getOffset(id) {
  return swipeOffsets[id] ?? 0
}

function onTouchStart(e, id) {
  if (editingId.value && editingId.value !== id) {
    commitEdit(editingId.value)
  }
  if (openId.value && openId.value !== id) {
    swipeOffsets[openId.value] = 0
    openId.value = null
  }
  _startX = e.touches[0].clientX
}

function onTouchMove(e, id) {
  const dx = e.touches[0].clientX - _startX
  if (dx >= 0) return
  draggingId.value = id
  swipeOffsets[id] = Math.max(dx, -REVEAL_W)
}

function onTouchEnd(id) {
  draggingId.value = null
  const offset = getOffset(id)
  if (Math.abs(offset) >= SNAP_THRESHOLD) {
    swipeOffsets[id] = -REVEAL_W
    openId.value = id
  } else {
    swipeOffsets[id] = 0
    if (openId.value === id) openId.value = null
  }
}

function onMoveUp(id) {
  store.moveUp(id)
  swipeOffsets[id] = 0
  openId.value = null
}

function onSwipeDelete(todo) {
  swipeOffsets[todo.id] = 0
  openId.value = null
  confirmDelete(todo)
}

function onDocumentTouch(e) {
  if (editingId.value && !e.target.closest('.edit-textarea')) {
    commitEdit(editingId.value)
  }
  if (openId.value) {
    swipeOffsets[openId.value] = 0
    openId.value = null
  }
}

function closeOpenSwipe() {
  if (openId.value) {
    swipeOffsets[openId.value] = 0
    openId.value = null
  }
}

onMounted(() => {
  document.addEventListener('click', closeOpenSwipe)
  document.addEventListener('touchstart', onDocumentTouch, { passive: true })
})
onUnmounted(() => {
  document.removeEventListener('click', closeOpenSwipe)
  document.removeEventListener('touchstart', onDocumentTouch)
})
</script>

<template>
  <ul class="todo-list">
    <li v-if="store.filteredTodos.length === 0" class="empty">
      {{ locale.t.empty }}
    </li>
    <li
      v-for="todo in store.filteredTodos"
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
        <button class="swipe-up" @click="onMoveUp(todo.id)">↑</button>
        <button class="swipe-delete" @click="onSwipeDelete(todo)">✕</button>
      </div>
    </li>
  </ul>

  <Teleport to="body">
    <Transition name="modal">
      <div v-if="modal" class="confirm-overlay" @click.self="modal = null">
        <div class="confirm-modal">
          <p class="confirm-msg">{{ modal.msg }}</p>
          <div class="confirm-actions">
            <button class="confirm-cancel" @click="modal = null">{{ locale.t.cancel }}</button>
            <button
              class="confirm-ok"
              :class="{ 'confirm-ok--danger': modal.danger }"
              @click="modal.onConfirm(); modal = null"
            >{{ locale.t.confirm }}</button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.todo-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.todo-list .empty {
  display: block;
  border: none;
  padding: 48px 0;
  text-align: center;
  color: var(--text);
  font-size: 14px;
  opacity: 0.72;
}

/* swipe wrapper — clips the sliding content */
.swipe-wrap {
  position: relative;
  overflow: hidden;
  border-radius: 8px;
  border: 1px solid var(--border);
}

/* sliding content layer */
.item-content {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 12px;
  background: var(--surface, #fff);
  transition: transform 0.22s ease;
  will-change: transform;
  position: relative;
  z-index: 1;
  min-width: 0;
}

/* suppress transition during live drag for responsiveness */
.swipe-wrap.dragging .item-content {
  transition: none;
}

.swipe-wrap.done .item-content span {
  opacity: 0.45;
}

.item-content span {
  flex: 1;
  font-size: 16px;
  color: var(--text-h);
  white-space: pre-wrap;
  word-break: break-word;
  cursor: default;
  min-width: 0;
}

.edit-textarea {
  flex: 1;
  padding: 4px 8px;
  border: 1px solid var(--accent);
  border-radius: 4px;
  font-size: 16px;
  font-family: inherit;
  line-height: 1.5;
  background: var(--bg);
  color: var(--text-h);
  outline: none;
  resize: none;
  overflow: hidden;
  min-height: 28px;
}

/* done toggle button */
.done-btn {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  color: var(--priority-none);
  font-size: 20px;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.15s;
  padding: 0;
}

.done-btn--done {
  color: #22c55e;
}

@media (hover: hover) {
  .done-btn:not(.done-btn--done):hover { color: #22c55e; }
  .done-btn--done:hover { color: #16a34a; }
}

/* × button — hidden on touch devices, shown on mouse hover */
.item-content .delete {
  background: transparent;
  border: none;
  color: var(--text);
  font-size: 22px;
  line-height: 1;
  cursor: pointer;
  padding: 0 2px;
  flex-shrink: 0;
}

@media (pointer: coarse) {
  .item-content .delete {
    display: none;
  }
}

@media (hover: hover) {
  .item-content .delete:hover {
    color: var(--accent);
  }
}

/* revealed action buttons behind the row */
.swipe-actions {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  display: flex;
  z-index: 0;
}

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
</style>
