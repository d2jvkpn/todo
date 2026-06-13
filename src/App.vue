<script setup>
import { ref, onMounted, computed } from 'vue'
import TodoInput from './components/TodoInput.vue'
import TodoFilter from './components/TodoFilter.vue'
import TodoList from './components/TodoList.vue'
import SideMenu from './components/SideMenu.vue'
import { useThemeStore } from './stores/theme'

useThemeStore()

const menuOpen = ref(false)

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const today = computed(() => {
  const d = new Date()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${m}-${day}(${DAY_NAMES[d.getDay()]})`
})
const headerRef = ref(null)
const inputRef = ref(null)

onMounted(() => {
  const update = () => {
    document.documentElement.style.setProperty('--header-h', headerRef.value.offsetHeight + 'px')
    document.documentElement.style.setProperty(
      '--menu-top',
      inputRef.value.getBoundingClientRect().top + 'px'
    )
  }
  update()
  const observer = new ResizeObserver(update)
  observer.observe(headerRef.value)
  observer.observe(inputRef.value)
  window.addEventListener('resize', update)
})
</script>

<template>
  <div class="app">
    <SideMenu :open="menuOpen" @close="menuOpen = false" />
    <header ref="headerRef" class="app-header">
      <div class="app-title">
        <div class="app-title-left">
          <button class="app-icon-btn" @click="menuOpen = !menuOpen">
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
        <span class="header-date">{{ today }}</span>
      </div>
      <div ref="inputRef">
        <TodoInput />
      </div>
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
  overscroll-behavior: contain;
  padding: 16px;
}

.app-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.app-title-left {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.app-icon-btn {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
}

.header-date {
  font-size: 15px;
  color: var(--text-h);
  white-space: nowrap;
  flex-shrink: 0;
  letter-spacing: 0.01em;
}

.app-icon {
  width: 22px;
  height: 22px;
  flex-shrink: 0;
}

h1 {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-h);
}
</style>
