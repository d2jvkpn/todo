<script setup>
import { ref, computed, onUnmounted } from 'vue'
import { useLocaleStore } from '../stores/locale'

const props = defineProps({
  priority: { type: String, default: 'none' }
})
const emit = defineEmits(['update:priority'])

const locale = useLocaleStore()
const open = ref(false)
const dotRef = ref(null)
const pickerPos = ref({ top: 0, left: 0 })

const OPTIONS = ['none', 'normal', 'important', 'urgent']

const labels = computed(() => ({
  none:      locale.t.priorityNone,
  normal:    locale.t.priorityNormal,
  important: locale.t.priorityImportant,
  urgent:    locale.t.priorityUrgent,
}))

function openPicker(e) {
  e.stopPropagation()
  const rect = dotRef.value.getBoundingClientRect()
  pickerPos.value = { top: rect.bottom + 6, left: rect.left }
  open.value = true
}

function choose(val, e) {
  e.stopPropagation()
  emit('update:priority', val)
  open.value = false
}

function close() {
  open.value = false
}

document.addEventListener('click', close)
onUnmounted(() => document.removeEventListener('click', close))
</script>

<template>
  <button
    ref="dotRef"
    class="pdot"
    :class="`pdot--${priority}`"
    type="button"
    @click="openPicker"
  />
  <Teleport to="body">
    <div
      v-if="open"
      class="pdot-picker"
      :style="{ top: pickerPos.top + 'px', left: pickerPos.left + 'px' }"
      @click.stop
    >
      <button
        v-for="opt in OPTIONS"
        :key="opt"
        class="pdot-option"
        :class="{ 'pdot-option--active': opt === priority }"
        type="button"
        @click="choose(opt, $event)"
      >
        <span class="pdot" :class="`pdot--${opt}`" />
        <span>{{ labels[opt] }}</span>
      </button>
    </div>
  </Teleport>
</template>

<style scoped>
.pdot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  flex-shrink: 0;
  display: block;
  padding: 0;
  cursor: pointer;
  border: 2px solid var(--priority-none);
  background: transparent;
}

.pdot--none      { border: 2px solid var(--priority-none); background: transparent; }
.pdot--normal    { border: none; background: var(--priority-normal); }
.pdot--important { border: none; background: var(--priority-important); }
.pdot--urgent    { border: none; background: var(--priority-urgent); }

/* picker 弹出层（Teleport 内仍保留 scoped 属性，无需 :global）*/
.pdot-picker {
  position: fixed;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.14);
  padding: 4px;
  display: flex;
  flex-direction: column;
  z-index: 300;
  min-width: 110px;
}

.pdot-option {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border: none;
  background: transparent;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  color: var(--text-h);
  white-space: nowrap;
  width: 100%;
  text-align: left;
}

.pdot-option--active {
  background: var(--accent-bg);
}

@media (hover: hover) {
  .pdot-option:hover {
    background: var(--accent-bg);
  }
}
</style>
