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
