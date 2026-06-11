<script setup>
import { ref } from 'vue'
import { useLocaleStore } from '../stores/locale'
import { useTodosStore } from '../stores/todos'

defineProps({ open: Boolean })
const emit = defineEmits(['close'])

const localeStore = useLocaleStore()
const todosStore = useTodosStore()
const showLang = ref(false)
const showAbout = ref(false)
const fileInput = ref(null)

function doExport() {
  todosStore.exportTodos()
  closeAll()
}

async function handleImport(e) {
  const file = e.target.files[0]
  if (!file) return
  try {
    await todosStore.importTodos(file)
    closeAll()
  } catch {
    alert(localeStore.t.importError)
  }
  e.target.value = ''
}

const languages = [
  { value: 'zh', label: '中文' },
  { value: 'en', label: 'English' },
]

function selectLang(lang) {
  localeStore.locale = lang
  showLang.value = false
}

function closeAll() {
  showLang.value = false
  showAbout.value = false
  emit('close')
}
</script>

<template>
  <Teleport to="body">
    <!-- 遮罩 -->
    <Transition name="overlay">
      <div v-if="open" class="menu-overlay" @click="closeAll" />
    </Transition>

    <!-- 主菜单抽屉 -->
    <Transition name="drawer">
      <div v-if="open" class="menu-drawer">
        <div class="menu-item" @click="doExport">
          <span>{{ localeStore.t.exportData }}</span>
        </div>
        <div class="menu-item" @click="fileInput.click()">
          <span>{{ localeStore.t.importData }}</span>
        </div>
        <div class="menu-divider" />
        <div class="menu-item" @click="showLang = !showLang">
          <span>{{ localeStore.t.language }}</span>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M6 4l4 4-4 4" stroke="currentColor" stroke-width="1.5"
                  stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div class="menu-item" @click="showAbout = true">
          <span>{{ localeStore.t.about }}</span>
        </div>
        <input ref="fileInput" type="file" accept=".json" style="display:none" @change="handleImport" />
      </div>
    </Transition>

    <!-- 语言子面板（抽屉右侧滑出） -->
    <Transition name="panel">
      <div v-if="open && showLang" class="menu-panel">
        <div
          v-for="lang in languages"
          :key="lang.value"
          class="menu-item"
          @click="selectLang(lang.value)"
        >
          <span>{{ lang.label }}</span>
          <svg v-if="localeStore.locale === lang.value"
               width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M3 8l4 4 6-6" stroke="var(--accent)" stroke-width="2"
                  stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
      </div>
    </Transition>

    <!-- 关于弹窗 -->
    <Transition name="modal">
      <div v-if="showAbout" class="about-overlay" @click.self="showAbout = false">
        <div class="about-modal">
          <div class="about-modal-title">TODO</div>
          <p class="about-modal-desc">{{ localeStore.t.aboutDesc }}</p>
          <div class="about-modal-stack">Vue 3 · Pinia · Vite</div>
          <div class="about-modal-version">v1.0.0</div>
          <button class="about-modal-close" @click="showAbout = false">
            {{ localeStore.t.close }}
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
