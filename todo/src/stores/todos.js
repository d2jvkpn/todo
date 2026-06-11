import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'

export const useTodosStore = defineStore('todos', () => {
  // 迁移旧格式：done: boolean → status: 'active' | 'done'
  const raw = JSON.parse(localStorage.getItem('todos') || '[]')
  const todos = ref(raw.map(t =>
    'done' in t && !('status' in t)
      ? { id: t.id, text: t.text, status: t.done ? 'done' : 'active' }
      : t
  ))
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
    // crypto.randomUUID() 仅在安全上下文（HTTPS / localhost）可用，
    // 通过局域网 IP 访问时降级为时间戳 + 随机数
    const id = window.isSecureContext
      ? crypto.randomUUID()
      : Date.now().toString(36) + Math.random().toString(36).slice(2)
    todos.value.push({ id, text, status: 'active' })
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

  function setFilter(value) {
    filter.value = value
  }

  async function exportTodos() {
    const now = new Date()
    const date = now.toISOString().slice(0, 10)
    const ts = now.getTime()
    const filename = `TODO.${date}-${ts}.json`
    const content = JSON.stringify(todos.value, null, 2)

    if ('showSaveFilePicker' in window) {
      try {
        const handle = await window.showSaveFilePicker({
          suggestedName: filename,
          types: [{ description: 'JSON', accept: { 'application/json': ['.json'] } }],
        })
        const writable = await handle.createWritable()
        await writable.write(content)
        await writable.close()
      } catch {
        // 用户取消，不做任何操作
      }
    } else {
      // 降级：触发浏览器下载
      const blob = new Blob([content], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.click()
      URL.revokeObjectURL(url)
    }
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

  return { todos, filter, filteredTodos, addTodo, toggleTodo, editTodo, deleteTodo, setFilter, exportTodos, importTodos }
})
