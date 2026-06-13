import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'

const messages = {
  zh: {
    placeholder: '添加新任务...',
    add: '添加',
    filters: [
      { value: 'active', label: '未完成' },
      { value: 'done', label: '已完成' },
      { value: 'all', label: '全部' },
    ],
    empty: '暂无任务',
    confirmDelete: (p) => `确认删除「${p}」？`,
    confirmMarkDone:   (p) => `完成「${p}」？`,
    confirmMarkUndone: (p) => `撤销完成「${p}」？`,
    exportData: '导出',
    importData: '导入',
    checkUpdates: '检查更新',
    checkingUpdates: '检查中...',
    updateSuccess: '更新完成',
    updateOffline: '当前离线，无法检查更新',
    updateFailed: '检查更新失败',
    importError: '导入失败：文件格式无效',
    language: '语言',
    about: '关于',
    close: '关闭',
    aboutDesc: '一个简洁的移动端待办应用',
    configCachedTime: (time) => time,
    techsLabel: '技术栈',
    versionLabel: '版本',
    cachedLabel: '缓存时间',
    repositoryLabel: '仓库',
    configCachePending: '尚未缓存',
    priorityNone:      '无',
    priorityNormal:    '普通',
    priorityImportant: '重要',
    priorityUrgent:    '紧急',
    delete:  '删除',
    clearData: '清空数据',
    confirmClearData: '确认清空所有数据？此操作不可恢复。',
    cancel:  '取消',
    confirm: '确定',
    markDone:   '完成',
    markUndone: '撤销完成',
    techs:      'Vue 3 · Pinia · Vite · PWA',
    version:    `v${__APP_VERSION__}`,
    repository: 'https://github.com/d2jvkpn/todo',
    theme:       '主题',
    themeSystem: '跟随系统',
    themeLight:  '浅色',
    themeDark:   '深色',
  },
  en: {
    placeholder: 'Add a task...',
    add: 'Add',
    filters: [
      { value: 'active', label: 'Active' },
      { value: 'done', label: 'Done' },
      { value: 'all', label: 'All' },
    ],
    empty: 'No tasks',
    confirmDelete: (p) => `Delete "${p}"?`,
    confirmMarkDone:   (p) => `Mark "${p}" as done?`,
    confirmMarkUndone: (p) => `Undo "${p}"?`,
    exportData: 'Export',
    importData: 'Import',
    checkUpdates: 'Check updates',
    checkingUpdates: 'Checking...',
    updateSuccess: 'Update complete',
    updateOffline: 'Offline: cannot check updates',
    updateFailed: 'Update check failed',
    importError: 'Import failed: invalid file format',
    language: 'Language',
    about: 'About',
    close: 'Close',
    aboutDesc: 'A minimal mobile todo app',
    configCachedTime: (time) => time,
    techsLabel: 'Techs',
    versionLabel: 'Version',
    cachedLabel: 'Cached',
    repositoryLabel: 'Repo',
    configCachePending: 'Not cached yet',
    priorityNone:      'None',
    priorityNormal:    'Normal',
    priorityImportant: 'Important',
    priorityUrgent:    'Urgent',
    delete:  'Delete',
    clearData: 'Clear data',
    confirmClearData: 'Clear all data? This cannot be undone.',
    cancel:  'Cancel',
    confirm: 'OK',
    markDone:   'Done',
    markUndone: 'Undo',
    techs:      'Vue 3 · Pinia · Vite · PWA',
    version:    `v${__APP_VERSION__}`,
    repository: 'https://github.com/d2jvkpn/todo',
    theme:       'Theme',
    themeSystem: 'System',
    themeLight:  'Light',
    themeDark:   'Dark',
  },
}

export const useLocaleStore = defineStore('locale', () => {
  const browserLang = navigator.language?.startsWith('zh') ? 'zh' : 'en'
  const locale = ref(localStorage.getItem('locale') || browserLang)

  watch(locale, (val) => localStorage.setItem('locale', val))

  const t = computed(() => messages[locale.value])

  function toggle() {
    locale.value = locale.value === 'zh' ? 'en' : 'zh'
  }

  return { locale, t, toggle }
})
