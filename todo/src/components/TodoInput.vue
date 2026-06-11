<script setup>
import { ref } from 'vue'
import { useTodosStore } from '../stores/todos'
import { useLocaleStore } from '../stores/locale'

const store = useTodosStore()
const locale = useLocaleStore()
const text = ref('')

function add() {
  const trimmed = text.value.trim()
  if (!trimmed) return
  store.addTodo(trimmed)
  text.value = ''
}
</script>

<template>
  <div class="todo-input">
    <textarea
      v-model="text"
      :placeholder="locale.t.placeholder"
      rows="1"
    />
    <button :class="{ empty: !text.trim() }" @click="add">{{ locale.t.add }}</button>
  </div>
</template>

<style scoped>
.todo-input {
  display: flex;
  gap: 8px;
}

.todo-input textarea {
  flex: 1;
  padding: 12px 16px;
  border: 1px solid var(--border);
  border-radius: 8px;
  font-size: 16px;
  background: var(--bg);
  color: var(--text-h);
  outline: none;
  resize: none;
  font-family: inherit;
  line-height: 1.5;
  min-height: 46px;
  max-height: 120px;
  overflow-y: auto;
}

.todo-input textarea:focus {
  border-color: var(--accent);
}

.todo-input button {
  padding: 12px 20px;
  background: var(--accent);
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  white-space: nowrap;
}

.todo-input button.empty {
  opacity: 0.4;
}
</style>
