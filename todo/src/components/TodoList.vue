<script setup>
import { ref, nextTick } from 'vue'
import { useTodosStore } from '../stores/todos'
import { useLocaleStore } from '../stores/locale'
import PriorityDot from './PriorityDot.vue'

const store = useTodosStore()
const locale = useLocaleStore()
const editingId = ref(null)
const editingText = ref('')
function confirmToggle(todo) {
  const oneline = todo.text.replace(/\s+/g, ' ').trim()
  const preview = oneline.length > 15 ? oneline.slice(0, 15) + '…' : oneline
  const msg = todo.status === 'done' ? locale.t.confirmUndone(preview) : locale.t.confirmDone(preview)
  if (window.confirm(msg)) store.toggleTodo(todo.id)
}

function confirmDelete(todo) {
  const oneline = todo.text.replace(/\s+/g, ' ').trim()
  const preview = oneline.length > 15 ? oneline.slice(0, 15) + '…' : oneline
  if (window.confirm(locale.t.confirmDelete(preview))) store.deleteTodo(todo.id)
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
</template>
