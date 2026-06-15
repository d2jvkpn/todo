import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { generateId, downloadFile } from '@/utils/utils'

export const useTodosStore = defineStore('todos', () => {
  const todos = ref(JSON.parse(localStorage.getItem('todos') || '[]'))
  const filter = ref('active')

  watch(todos, (val) => {
    localStorage.setItem('todos', JSON.stringify(val))
  }, { deep: true })

  const filteredTodos = computed(() => {
    if (filter.value === 'active') return todos.value.filter(t => t.status === 'active')
    if (filter.value === 'done') return todos.value.filter(t => t.status === 'done')
    return todos.value
  })

  function addTodo(text) {
    todos.value.push({ id: generateId(), text, status: 'active', priority: 'none', subtasks: [] })
  }

  function toggleTodo(id) {
    const todo = todos.value.find(t => t.id === id)
    if (todo) todo.status = todo.status === 'done' ? 'active' : 'done'
  }

  function editTodo(id, text) {
    const todo = todos.value.find(t => t.id === id)
    if (todo) todo.text = text
  }

  function deleteTodo(id) {
    todos.value = todos.value.filter(t => t.id !== id)
  }

  function clearAll() {
    todos.value = []
  }

  function setPriority(id, priority) {
    const todo = todos.value.find(t => t.id === id)
    if (todo) todo.priority = priority
  }

  function addSubtask(todoId, text) {
    const todo = todos.value.find(t => t.id === todoId)
    if (!todo) return
    todo.subtasks.push({ id: generateId(), text, done: false })
  }

  function deleteSubtask(todoId, subtaskId) {
    const todo = todos.value.find(t => t.id === todoId)
    if (!todo) return
    todo.subtasks = todo.subtasks.filter(s => s.id !== subtaskId)
  }

  function editSubtask(todoId, subtaskId, text) {
    const todo = todos.value.find(t => t.id === todoId)
    if (!todo) return
    const sub = todo.subtasks.find(s => s.id === subtaskId)
    if (sub) sub.text = text
  }

  function toggleSubtask(todoId, subtaskId) {
    const todo = todos.value.find(t => t.id === todoId)
    if (!todo) return
    const sub = todo.subtasks.find(s => s.id === subtaskId)
    if (!sub) return
    sub.done = !sub.done
  }

  function reorderTodosByIds(orderedFilteredIds) {
    // Find the slots (indices in todos[]) currently occupied by the filtered items
    const positions = orderedFilteredIds.map(id => todos.value.findIndex(t => t.id === id))
    const slots = [...positions].sort((a, b) => a - b)
    const newTodos = [...todos.value]
    orderedFilteredIds.forEach((id, i) => {
      newTodos[slots[i]] = todos.value.find(t => t.id === id)
    })
    todos.value = newTodos
  }

  function setFilter(value) {
    filter.value = value
  }

  async function exportTodos() {
    const now = new Date()
    const filename = `TODO.${now.toISOString().slice(0, 10)}-${now.getTime()}.json`
    await downloadFile(JSON.stringify(todos.value, null, 2), filename)
  }

  function importTodos(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result)
          if (!Array.isArray(data) || data.some(i => !('id' in i && 'text' in i && 'status' in i))) {
            throw new Error('invalid')
          }
          todos.value = data
          resolve()
        } catch {
          reject()
        }
      }
      reader.readAsText(file)
    })
  }

  return {
    todos,
    filter, filteredTodos,
    addTodo, toggleTodo, editTodo, deleteTodo, clearAll,
    setPriority, setFilter,
    exportTodos, importTodos,
    addSubtask, editSubtask, toggleSubtask, deleteSubtask,
    reorderTodosByIds,
  }
})
