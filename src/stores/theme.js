import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useThemeStore = defineStore('theme', () => {
  const theme = ref(localStorage.getItem('theme') || 'system')

  function apply(val) {
    if (val === 'system') {
      document.documentElement.removeAttribute('data-theme')
    } else {
      document.documentElement.setAttribute('data-theme', val)
    }
  }

  apply(theme.value)

  watch(theme, (val) => {
    localStorage.setItem('theme', val)
    apply(val)
  })

  return { theme }
})
