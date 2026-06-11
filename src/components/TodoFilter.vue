<script setup>
import { useTodosStore } from '../stores/todos'
import { useLocaleStore } from '../stores/locale'

const store = useTodosStore()
const locale = useLocaleStore()
</script>

<template>
  <div class="todo-filter">
    <button
      v-for="f in locale.t.filters"
      :key="f.value"
      :class="{ active: store.filter === f.value }"
      @click="store.setFilter(f.value)"
    >
        {{ f.label }}
    </button>
  </div>
</template>

<style scoped>
.todo-filter {
  display: flex;
  gap: 8px;
}

.todo-filter button {
  flex: 1;
  padding: 8px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: transparent;
  color: var(--text);
  font-size: 14px;
  cursor: pointer;
}

.todo-filter button.active {
  background: var(--accent-bg);
  border-color: var(--accent-border);
  color: var(--accent);
}
</style>
