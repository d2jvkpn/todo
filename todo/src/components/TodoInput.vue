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
