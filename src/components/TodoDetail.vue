<script setup>
import { ref, nextTick } from 'vue'
import { useTodosStore } from '@/stores/todos'
import { useLocaleStore } from '@/stores/locale'

const props = defineProps({
  todo: { type: Object, required: true }
})
const emit = defineEmits(['close'])

const store = useTodosStore()
const locale = useLocaleStore()
const isOpen = ref(false)
const editText = ref(props.todo.text)
const newSubtaskText = ref('')
const subtaskInputRef = ref(null)
const titleRef = ref(null)
const subtaskComposing = ref(false)
const editingSubtaskId = ref(null)
const editingSubtaskText = ref('')
const subtaskEditComposing = ref(false)

function startEditSubtask(sub) {
  editingSubtaskId.value = sub.id
  editingSubtaskText.value = sub.text
  nextTick(() => {
    const el = document.getElementById('subtask-edit-' + sub.id)
    el?.focus()
    el?.select()
  })
}

function saveSubtask(sub) {
  const t = editingSubtaskText.value.trim()
  if (t && t !== sub.text) store.editSubtask(props.todo.id, sub.id, t)
  editingSubtaskId.value = null
}

function handleSubtaskEditEnter(sub) {
  if (!subtaskEditComposing.value) saveSubtask(sub)
}

function autoResize() {
  const el = titleRef.value
  if (!el) return
  el.style.height = 'auto'
  el.style.height = el.scrollHeight + 'px'
}

nextTick(() => {
  isOpen.value = true
  autoResize()
})

const CLOSE_DURATION = 250  // 与 CSS transition 时长同步

function close() {
  isOpen.value = false
  setTimeout(() => emit('close'), CLOSE_DURATION)
}

function saveText() {
  const t = editText.value.trim()
  if (!t) { editText.value = props.todo.text; return }
  if (t !== props.todo.text) store.editTodo(props.todo.id, t)
}

function addSubtask() {
  const t = newSubtaskText.value.trim()
  if (!t) return
  store.addSubtask(props.todo.id, t)
  newSubtaskText.value = ''
  nextTick(() => subtaskInputRef.value?.focus())
}

function handleSubtaskEnter() {
  if (!subtaskComposing.value) addSubtask()
}
</script>

<template>
  <Teleport to="body">
    <div
      class="detail-backdrop"
      :class="{ 'is-open': isOpen }"
      @click.self="close"
    >
      <div class="detail-sheet">
        <div class="detail-handle" />
        <textarea
          ref="titleRef"
          v-model="editText"
          class="detail-title"
          rows="1"
          @input="autoResize"
          @blur="saveText"
        />
        <div class="subtask-scroll">
          <ul class="subtask-list">
          <li
            v-for="sub in todo.subtasks"
            :key="sub.id"
            class="subtask-row"
          >
            <input
              type="checkbox"
              :checked="sub.done"
              @change="store.toggleSubtask(todo.id, sub.id)"
            />
            <input
              v-if="editingSubtaskId === sub.id"
              :id="'subtask-edit-' + sub.id"
              v-model="editingSubtaskText"
              class="subtask-edit-input"
              @compositionstart="subtaskEditComposing = true"
              @compositionend="subtaskEditComposing = false"
              @keydown.enter.prevent="handleSubtaskEditEnter(sub)"
              @keydown.esc="editingSubtaskId = null"
              @blur="saveSubtask(sub)"
            />
            <span
              v-else
              :class="{ 'subtask-done': sub.done }"
              @click="startEditSubtask(sub)"
            >{{ sub.text }}</span>
            <button class="subtask-delete" @click="store.deleteSubtask(todo.id, sub.id)">×</button>
          </li>
          </ul>
        </div>
        <div class="subtask-add">
          <input
            ref="subtaskInputRef"
            v-model="newSubtaskText"
            class="subtask-input"
            :placeholder="locale.t.addSubtask"
            @compositionstart="subtaskComposing = true"
            @compositionend="subtaskComposing = false"
            @keydown.enter.prevent="handleSubtaskEnter"
          />
          <button class="subtask-confirm" @click="addSubtask">✓</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.detail-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0);
  transition: background 0.25s;
  z-index: 50;
  display: flex;
  align-items: flex-end;
}
.detail-backdrop.is-open {
  background: rgba(0, 0, 0, 0.45);
}

.detail-sheet {
  width: 100%;
  max-height: 70vh;
  background: var(--surface, #fff);
  border-radius: 16px 16px 0 0;
  padding: 12px 16px 32px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  overflow: hidden;
  transform: translateY(100%);
  transition: transform 0.25s ease;
}

.subtask-scroll {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
}
.detail-backdrop.is-open .detail-sheet {
  transform: translateY(0);
}

.detail-handle {
  width: 36px;
  height: 4px;
  background: var(--border, #e5e7eb);
  border-radius: 2px;
  align-self: center;
  flex-shrink: 0;
}

.detail-title {
  width: 100%;
  font-size: 17px;
  font-weight: 500;
  color: var(--text-h);
  background: transparent;
  border: none;
  padding: 4px 0 0;
  resize: none;
  outline: none;
  font-family: inherit;
  line-height: 1.5;
  overflow: hidden;
  box-sizing: border-box;
  height: auto;
  flex-shrink: 0;
  max-height: 40vh;
}

.subtask-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0;
}

.subtask-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 5px 4px;
}

.subtask-row input[type="checkbox"] {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  cursor: pointer;
  accent-color: #22c55e;
}

.subtask-row span {
  flex: 1;
  font-size: 15px;
  color: var(--text-h);
  word-break: break-word;
  cursor: text;
}

.subtask-edit-input {
  flex: 1;
  border: none;
  border-bottom: 1px solid var(--border);
  background: transparent;
  font-size: 16px;
  color: var(--text-h);
  outline: none;
  font-family: inherit;
  padding: 0;
}

.subtask-done {
  opacity: 0.4;
  text-decoration: line-through;
}

.subtask-delete {
  background: transparent;
  border: none;
  color: var(--text);
  font-size: 20px;
  line-height: 1;
  cursor: pointer;
  padding: 0 4px;
  flex-shrink: 0;
  opacity: 0.45;
}

@media (hover: hover) {
  .subtask-delete:hover { opacity: 1; color: #ef4444; }
}

.subtask-add {
  display: flex;
  gap: 8px;
  align-items: center;
  border-top: 1px solid var(--border);
  padding-top: 10px;
  flex-shrink: 0;
}

.subtask-input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 16px;
  color: var(--text-h);
  outline: none;
  font-family: inherit;
}

.subtask-input::placeholder {
  color: var(--text);
  opacity: 0.45;
}

.subtask-confirm {
  background: transparent;
  border: none;
  color: #22c55e;
  font-size: 20px;
  cursor: pointer;
  padding: 0 4px;
  flex-shrink: 0;
}
</style>
