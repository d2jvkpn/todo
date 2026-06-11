<script setup>
import { ref, nextTick } from 'vue'
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
  const msg = todo.status === 'done' ? locale.t.confirmUndone(preview) : locale.t.confirmDone(preview)
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
    if (ta) { ta.style.height = 'auto'; ta.style.height = ta.scrollHeight + 'px' }
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
</script>

<template>
  <ul class="todo-list">
    <li v-if="store.filteredTodos.length === 0" class="empty">
      {{ locale.t.empty }}
    </li>
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

.todo-list li.empty {
  display: block;
  border: none;
  padding: 48px 0;
  text-align: center;
  color: var(--text);
  font-size: 14px;
  opacity: 0.72;
}

.todo-list li {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
}

.todo-list li.done span {
  text-decoration: line-through;
  opacity: 0.45;
}

.todo-list li input[type="checkbox"] {
  width: 20px;
  height: 20px;
  accent-color: var(--accent);
  flex-shrink: 0;
  cursor: pointer;
}

.todo-list li span {
  flex: 1;
  font-size: 16px;
  color: var(--text-h);
  word-break: break-word;
  white-space: pre-wrap;
  cursor: default;
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

.todo-list .delete {
  background: transparent;
  border: none;
  color: var(--text);
  font-size: 22px;
  line-height: 1;
  cursor: pointer;
  padding: 0 2px;
  flex-shrink: 0;
}

@media (hover: hover) {
  .todo-list .delete:hover {
    color: var(--accent);
  }
}
</style>
