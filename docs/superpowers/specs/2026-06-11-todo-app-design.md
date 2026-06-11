# Todo App 设计文档

## 概述

Vue 3 移动端 Todo List，用于学习 Vue 3 核心概念、Pinia 状态管理和 localStorage 持久化。

## 技术栈

- Vue 3 + Vite（现有脚手架，位于 `my-app/`）
- Pinia（状态管理）
- 原生 CSS（移动端手写样式）
- localStorage（数据持久化）

## 功能

- 添加 Todo
- 勾选完成 / 取消完成
- 双击编辑内容
- 删除
- 按状态筛选：全部 / 未完成 / 已完成
- 刷新页面数据不丢失

## 文件结构

```
my-app/src/
├── main.js
├── App.vue
├── stores/
│   └── todos.js
├── components/
│   ├── TodoInput.vue
│   ├── TodoFilter.vue
│   └── TodoList.vue
└── style.css
```

## 数据结构

```js
// 单条 todo
{ id: string, text: string, done: boolean }

// store state
{ todos: Todo[], filter: 'all' | 'active' | 'done' }
```

## 组件职责

### `App.vue`
根组件，按顺序组合三个子组件，只负责整体布局，不含业务逻辑。

### `TodoInput.vue`
- 文本输入框 + 添加按钮
- 按回车或点击按钮触发 `store.addTodo(text)`
- 添加后清空输入框，输入为空时禁用添加

### `TodoFilter.vue`
- 三个标签：全部 / 未完成 / 已完成
- 当前选中项高亮，点击调用 `store.setFilter(value)`

### `TodoList.vue`
- 根据 `store.filteredTodos` 渲染列表
- 每项：勾选框、文字（双击进入编辑态）、删除按钮
- 列表为空时显示提示文字

## Pinia Store（`stores/todos.js`）

```js
state:   { todos, filter }
getters: { filteredTodos }
actions: { addTodo, toggleTodo, editTodo, deleteTodo, setFilter }
```

**localStorage 同步**：用 `watch` 深度监听 `todos`，每次变更自动写入 `localStorage['todos']`。初始化时从 `localStorage` 读取，无数据则用空数组。持久化逻辑封装在 store 内部，组件无需关心。
