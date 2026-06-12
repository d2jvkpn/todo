<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useLocaleStore } from '../stores/locale'
import { useTodosStore } from '../stores/todos'
import { useThemeStore } from '../stores/theme'

defineProps({ open: Boolean })
const emit = defineEmits(['close'])

const localeStore = useLocaleStore()
const todosStore = useTodosStore()
const themeStore = useThemeStore()
const showLang = ref(false)
const showTheme = ref(false)
const showAbout = ref(false)
const alertMsg = ref(null)
const fileInput = ref(null)
const checkingUpdates = ref(false)
const configCachedAt = ref(localStorage.getItem('appConfigCachedAt') || '')

const configCachedText = computed(() => {
  if (!configCachedAt.value) return localeStore.t.configCachePending
  const date = new Date(configCachedAt.value)
  if (Number.isNaN(date.getTime())) return localeStore.t.configCachePending
  return new Intl.DateTimeFormat(localeStore.locale, {
    dateStyle: 'medium',
    timeStyle: 'medium',
  }).format(date)
})

function updateConfigCachedTime(event) {
  configCachedAt.value = event?.detail || localStorage.getItem('appConfigCachedAt') || ''
}

onMounted(() => {
  window.addEventListener('app-config-cached', updateConfigCachedTime)
})

onUnmounted(() => {
  window.removeEventListener('app-config-cached', updateConfigCachedTime)
})

async function checkUpdates() {
  if (checkingUpdates.value) return
  checkingUpdates.value = true
  try {
    await window.todoCheckForUpdates?.()
    alertMsg.value = localeStore.t.updateSuccess
    closeAll()
  } catch {
    alertMsg.value = navigator.onLine ? localeStore.t.updateFailed : localeStore.t.updateOffline
  } finally {
    checkingUpdates.value = false
  }
}

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
    alertMsg.value = localeStore.t.importError
  }
  e.target.value = ''
}

const languages = [
  { value: 'en', label: 'English' },
  { value: 'zh', label: '中文' },
]

function selectLang(lang) {
  localeStore.locale = lang
  showLang.value = false
}

function selectTheme(val) {
  themeStore.theme = val
  showTheme.value = false
}

function closeAll() {
  showLang.value = false
  showTheme.value = false
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
      <div v-if="open" class="menu-drawer" @click="showLang = false; showTheme = false">
        <div class="menu-item" @click="doExport">
          <svg class="menu-icon" viewBox="0 0 16 16" fill="none">
            <path d="M8 9V3m0 0L5 6m3-3 3 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M3 12v1a1 1 0 001 1h8a1 1 0 001-1v-1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
          <span>{{ localeStore.t.exportData }}</span>
        </div>
        <div class="menu-item" @click="fileInput.click()">
          <svg class="menu-icon" viewBox="0 0 16 16" fill="none">
            <path d="M8 3v6m0 0L5 6m3 3 3-3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M3 12v1a1 1 0 001 1h8a1 1 0 001-1v-1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
          <span>{{ localeStore.t.importData }}</span>
        </div>
        <div class="menu-item" :class="{ 'menu-item--disabled': checkingUpdates }" @click="checkUpdates">
          <svg class="menu-icon" viewBox="0 0 16 16" fill="none">
            <path d="M13 5.5A5.5 5.5 0 104.8 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            <path d="M13 2.5v3h-3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span>{{ checkingUpdates ? localeStore.t.checkingUpdates : localeStore.t.checkUpdates }}</span>
        </div>
        <div class="menu-divider" />
        <div class="menu-item" @click.stop="showTheme = !showTheme; showLang = false">
          <svg class="menu-icon" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="5.5" stroke="currentColor" stroke-width="1.5"/>
            <path d="M8 2.5v2M8 11.5v2M2.5 8h2M11.5 8h2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
          <span>{{ localeStore.t.theme }}</span>
          <svg class="menu-item-arrow" width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M6 4l4 4-4 4" stroke="currentColor" stroke-width="1.5"
                  stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div class="menu-item" @click.stop="showLang = !showLang; showTheme = false">
          <svg class="menu-icon" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="5.5" stroke="currentColor" stroke-width="1.5"/>
            <path d="M8 2.5C6 4 5.5 6 5.5 8S6 12 8 13.5M8 2.5C10 4 10.5 6 10.5 8S10 12 8 13.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            <line x1="2.5" y1="8" x2="13.5" y2="8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
          <span>{{ localeStore.t.language }}</span>
          <svg class="menu-item-arrow" width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M6 4l4 4-4 4" stroke="currentColor" stroke-width="1.5"
                  stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div class="menu-item" @click="showAbout = true">
          <svg class="menu-icon" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="5.5" stroke="currentColor" stroke-width="1.5"/>
            <path d="M8 7.5v3.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            <circle cx="8" cy="5.5" r="0.75" fill="currentColor"/>
          </svg>
          <span>{{ localeStore.t.about }}</span>
        </div>
        <input ref="fileInput" type="file" accept=".json" style="display:none" @change="handleImport" />
      </div>
    </Transition>

    <!-- 主题子面板 -->
    <Transition name="panel">
      <div v-if="open && showTheme" class="menu-panel">
        <div
          v-for="opt in [
            { value: 'system', label: localeStore.t.themeSystem },
            { value: 'light',  label: localeStore.t.themeLight },
            { value: 'dark',   label: localeStore.t.themeDark },
          ]"
          :key="opt.value"
          class="menu-item"
          @click="selectTheme(opt.value)"
        >
          <span>{{ opt.label }}</span>
          <svg v-if="themeStore.theme === opt.value"
               width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M3 8l4 4 6-6" stroke="var(--accent)" stroke-width="2"
                  stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
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

    <!-- 导入错误提示 -->
    <Transition name="modal">
      <div v-if="alertMsg" class="confirm-overlay" @click.self="alertMsg = null">
        <div class="confirm-modal">
          <p class="confirm-msg">{{ alertMsg }}</p>
          <div class="confirm-actions">
            <button class="confirm-ok" @click="alertMsg = null">{{ localeStore.t.close }}</button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- 关于弹窗 -->
    <Transition name="modal">
      <div v-if="showAbout" class="about-overlay" @click.self="showAbout = false">
        <div class="about-modal">
          <div class="about-modal-title">TODO</div>
          <p class="about-modal-desc">{{ localeStore.t.aboutDesc }}</p>
          <div class="about-modal-meta">
            <div class="about-modal-meta-row">
              <span class="about-modal-meta-label">{{ localeStore.t.techsLabel }}</span>
              <span class="about-modal-meta-value">{{ localeStore.t.techs }}</span>
            </div>
            <div class="about-modal-meta-row">
              <span class="about-modal-meta-label">{{ localeStore.t.versionLabel }}</span>
              <span class="about-modal-meta-value">{{ localeStore.t.version }}</span>
            </div>
            <div class="about-modal-meta-row">
              <span class="about-modal-meta-label">{{ localeStore.t.cachedLabel }}</span>
              <span class="about-modal-meta-value">{{ localeStore.t.configCachedTime(configCachedText) }}</span>
            </div>
            <div class="about-modal-meta-row">
              <span class="about-modal-meta-label">{{ localeStore.t.repositoryLabel }}</span>
              <a class="about-modal-meta-value about-modal-meta-link" :href="localeStore.t.repository" target="_blank" rel="noopener">
                {{ localeStore.t.repository.replace('https://', '') }}
              </a>
            </div>
          </div>
          <button class="about-modal-close" @click="showAbout = false">
            {{ localeStore.t.close }}
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.menu-overlay {
  position: fixed;
  top: var(--menu-top, var(--header-h, 0));
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 100;
}

.menu-drawer {
  position: fixed;
  top: var(--menu-top, var(--header-h, 0));
  left: 0;
  bottom: 0;
  width: 220px;
  background: var(--surface);
  border-right: 1px solid var(--border);
  z-index: 101;
}

.menu-panel {
  position: fixed;
  top: var(--menu-top, var(--header-h, 0));
  left: 220px;
  width: 160px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-top: none;
  border-radius: 0 0 10px 0;
  z-index: 102;
  padding: 4px 0;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 20px;
  font-size: 15px;
  color: var(--text-h);
  cursor: pointer;
  user-select: none;
}

.menu-item:active {
  background: var(--accent-bg);
}

.menu-item--disabled {
  opacity: 0.55;
  pointer-events: none;
}

.menu-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  color: var(--text);
}

.menu-item-arrow {
  margin-left: auto;
  flex-shrink: 0;
  color: var(--text);
}

.menu-divider {
  height: 1px;
  background: var(--border);
  margin: 4px 0;
}

.about-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.about-modal {
  background: var(--surface);
  border-radius: 16px;
  padding: 28px 24px;
  width: 100%;
  max-width: 320px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.about-modal-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-h);
  text-align: center;
}

.about-modal-desc {
  font-size: 14px;
  color: var(--text);
  line-height: 1.5;
}

.about-modal-meta {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.about-modal-meta-row {
  display: grid;
  grid-template-columns: 76px minmax(0, 1fr);
  column-gap: 10px;
  align-items: baseline;
  font-size: 12px;
  line-height: 1.4;
}

.about-modal-meta-label {
  color: var(--text);
  opacity: 0.5;
}

.about-modal-meta-value {
  color: var(--text);
  opacity: 0.72;
  min-width: 0;
  text-decoration: none;
  word-break: break-word;
}

.about-modal-meta-link:hover {
  color: var(--accent);
  opacity: 1;
  text-decoration: underline;
}

.about-modal-close {
  margin-top: 8px;
  padding: 10px;
  background: var(--accent-bg);
  color: var(--accent);
  border: none;
  border-radius: 8px;
  font-size: 15px;
  cursor: pointer;
}
</style>
