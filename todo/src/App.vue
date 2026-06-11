<script setup>
import { ref, onMounted } from 'vue'
import TodoInput from './components/TodoInput.vue'
import TodoFilter from './components/TodoFilter.vue'
import TodoList from './components/TodoList.vue'
import SideMenu from './components/SideMenu.vue'

const menuOpen = ref(false)
const headerRef = ref(null)

onMounted(() => {
  const update = () =>
    document.documentElement.style.setProperty('--header-h', headerRef.value.offsetHeight + 'px')
  update()
  new ResizeObserver(update).observe(headerRef.value)
})
</script>

<template>
  <div class="app">
    <SideMenu :open="menuOpen" @close="menuOpen = false" />
    <header ref="headerRef" class="app-header">
      <div class="app-title">
        <button class="app-icon-btn" @click="menuOpen = true">
        <svg class="app-icon" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- 笔尖 -->
          <path d="M4 28 L4 22 L10 28 Z" fill="var(--accent)" opacity="0.7"/>
          <!-- 笔身 -->
          <path d="M4 22 L10 28 L24 14 L18 8 Z" fill="var(--accent)"/>
          <!-- 笔帽 -->
          <path d="M18 8 L21 5 C23 3 27 3 28 4 C29 5 29 9 27 11 L24 14 Z" fill="var(--accent)" opacity="0.85"/>
          <!-- 笔帽顶端高光 -->
          <path d="M21 5 C22 4 25 3.5 27 5" stroke="white" stroke-width="1" stroke-linecap="round" opacity="0.35" fill="none"/>
          <!-- 笔尖开缝 -->
          <line x1="4" y1="28" x2="7" y2="25" stroke="white" stroke-width="1" stroke-linecap="round" opacity="0.4"/>
        </svg>
        </button>
        <h1>TODO</h1>
      </div>
      <TodoInput />
      <TodoFilter />
    </header>
    <main class="app-body">
      <TodoList />
    </main>
  </div>
</template>

<style scoped>
.app {
  max-width: 480px;
  margin: 0 auto;
  height: 100svh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.app-header {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  background: var(--bg);
  border-bottom: 1px solid var(--border);
}

.app-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.app-title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.app-icon-btn {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
}

.app-icon {
  width: 22px;
  height: 22px;
  flex-shrink: 0;
}

h1 {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-h);
}
</style>
