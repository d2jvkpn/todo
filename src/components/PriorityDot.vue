<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useLocaleStore } from '../stores/locale'

const props = defineProps({
  priority: { type: String, default: 'none' },
  done: { type: Boolean, default: false }
})
const emit = defineEmits(['update:priority', 'toggle:done'])

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
  const pickerH = 140  // priority row + divider + done row + padding
  const top = rect.bottom + 6 + pickerH > window.innerHeight
    ? rect.top - pickerH - 6
    : rect.bottom + 6
  pickerPos.value = { top, left: rect.left }
  open.value = true
}

function choose(val, e) {
  e.stopPropagation()
  emit('update:priority', val)
  open.value = false
}

function toggleDone(e) {
  e.stopPropagation()
  emit('toggle:done')
  open.value = false
}

function close() {
  open.value = false
}

onMounted(() => document.addEventListener('click', close))
onUnmounted(() => document.removeEventListener('click', close))
</script>

<template>
  <button
    ref="dotRef"
    class="pdot"
    :class="[`pdot--${priority}`, { 'pdot--done': done }]"
    type="button"
    @click="openPicker"
  />
  <Teleport to="body">
    <Transition name="picker-fade">
      <div
        v-if="open"
        class="pdot-picker"
        :style="{ top: pickerPos.top + 'px', left: pickerPos.left + 'px' }"
        @click.stop
      >
        <div class="pdot-priority-row">
          <button
            v-for="opt in OPTIONS"
            :key="opt"
            class="pdot-option"
            :class="{ 'pdot-option--active': opt === priority }"
            type="button"
            @click="choose(opt, $event)"
          >
            <span class="pdot-opt-dot" :class="`pdot--${opt}`" />
            <span class="pdot-opt-label">{{ labels[opt] }}</span>
          </button>
        </div>
        <div class="pdot-divider" />
        <button
          class="pdot-done-btn"
          type="button"
          @click="toggleDone"
        >
          {{ done ? locale.t.markUndone : locale.t.markDone }}
        </button>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.pdot {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  flex-shrink: 0;
  display: block;
  padding: 0;
  cursor: pointer;
  position: relative;
}

/* extend tap target to ~40×40 without changing visual size */
.pdot::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 40px;
  height: 40px;
}

.pdot--done::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 11px;
  line-height: 1;
  color: #fff;
  pointer-events: none;
}

.pdot--none.pdot--done::after {
  color: var(--priority-none);
}

.pdot--none      { border: 2px solid var(--priority-none); background: transparent; }
.pdot--normal    { border: none; background: var(--priority-normal); }
.pdot--important { border: none; background: var(--priority-important); }
.pdot--urgent    { border: none; background: var(--priority-urgent); }

/* picker 弹出层 */
.pdot-picker {
  position: fixed;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 14px;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.16);
  padding: 8px 6px;
  display: flex;
  flex-direction: column;
  z-index: 300;
}

.pdot-priority-row {
  display: flex;
  flex-direction: row;
  gap: 2px;
}

.pdot-divider {
  height: 1px;
  background: var(--border);
  margin: 4px 4px;
}

.pdot-done-btn {
  border: none;
  background: transparent;
  border-radius: 10px;
  cursor: pointer;
  padding: 8px 12px;
  font-size: 13px;
  color: var(--text-h);
  text-align: center;
  width: 100%;
}

.pdot-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  padding: 8px 10px;
  border: none;
  background: transparent;
  border-radius: 10px;
  cursor: pointer;
  min-width: 52px;
}

.pdot-opt-dot {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: block;
  flex-shrink: 0;
  transition: transform 0.12s;
}

.pdot-opt-label {
  font-size: 11px;
  color: var(--text);
  white-space: nowrap;
}

.pdot-option--active .pdot-opt-dot {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

@media (hover: hover) {
  .pdot-option:hover {
    background: var(--accent-bg);
  }
  .pdot-option:hover .pdot-opt-dot {
    transform: scale(1.15);
  }
  .pdot-done-btn:hover {
    background: var(--accent-bg);
  }
}

/* 淡入动画 */
.picker-fade-enter-active { transition: opacity 0.12s, transform 0.12s; }
.picker-fade-leave-active { transition: opacity 0.1s; }
.picker-fade-enter-from   { opacity: 0; transform: translateY(-4px); }
.picker-fade-leave-to     { opacity: 0; }
</style>
