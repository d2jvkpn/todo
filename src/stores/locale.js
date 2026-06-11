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
    exportData: '导出',
    importData: '导入',
    importError: '导入失败：文件格式无效',
    language: '语言',
    about: '关于',
    close: '关闭',
    aboutDesc: '一个简洁的移动端待办应用',
    priorityNone:      '无',
    priorityNormal:    '普通',
    priorityImportant: '重要',
    priorityUrgent:    '紧急',
    cancel:  '取消',
    confirm: '确定',
    markDone:   '完成',
    markUndone: '撤销完成',
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
    exportData: 'Export',
    importData: 'Import',
    importError: 'Import failed: invalid file format',
    language: 'Language',
    about: 'About',
    close: 'Close',
    aboutDesc: 'A minimal mobile todo app',
    priorityNone:      'None',
    priorityNormal:    'Normal',
    priorityImportant: 'Important',
    priorityUrgent:    'Urgent',
    cancel:  'Cancel',
    confirm: 'OK',
    markDone:   'Done',
    markUndone: 'Undo',
  },
}

export const useLocaleStore = defineStore('locale', () => {
  const locale = ref(localStorage.getItem('locale') || 'zh')

  watch(locale, (val) => localStorage.setItem('locale', val))

  const t = computed(() => messages[locale.value])

  function toggle() {
    locale.value = locale.value === 'zh' ? 'en' : 'zh'
  }

  return { locale, t, toggle }
})
