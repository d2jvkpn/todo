# 设计文档：Todo 颜色重要程度标记

**日期：** 2026-06-11  
**状态：** 已批准

---

## 背景

现有 todo 条目仅有文字和完成状态，无法区分任务的轻重缓急。本功能为每个 todo 增加 4 级重要程度标记，用彩色圆点呈现，让用户一眼判断任务优先级。

---

## 交互设计

- **创建时**：新 todo 默认无优先级（灰色空心圆点）
- **修改方式**：点击 todo 条目上的圆点 → 弹出 4 色色盘 → 选择优先级
- **取消优先级**：在色盘中选"无"即可恢复灰色
- **点击外部**：色盘自动关闭

---

## 数据模型

`todo` 对象新增字段：

```js
priority: 'none' | 'normal' | 'important' | 'urgent'
```

| 值 | 中文 | 英文 | 颜色 |
|---|---|---|---|
| `none` | 无 | None | ⚪ `#d1d5db`（灰） |
| `normal` | 普通 | Normal | 🔵 `#3b82f6`（蓝） |
| `important` | 重要 | Important | 🟠 `#f59e0b`（橙） |
| `urgent` | 紧急 | Urgent | 🔴 `#ef4444`（红） |

**迁移：** 已有 todo 无 `priority` 字段时，读取时自动补 `'none'`，与现有 `status` 迁移逻辑一致。

---

## 组件架构

### 新建：`PriorityDot.vue`

| 项目 | 说明 |
|---|---|
| props | `priority: string` |
| emits | `update:priority` |
| 内部状态 | `open: ref(false)` 控制色盘显示 |
| 定位 | 色盘用 `position: fixed`，避免父容器 overflow 裁剪 |
| 关闭逻辑 | `document` 点击监听，unmount 时清除 |

### 修改：`TodoList.vue`

在每个 `<li>` 的 checkbox 左侧插入 `<PriorityDot>`：

```html
<PriorityDot
  :priority="todo.priority"
  @update:priority="store.setPriority(todo.id, $event)"
/>
```

### 修改：`stores/todos.js`

- `addTodo(text)` 新增 `priority: 'none'`
- 迁移逻辑加入 `priority ?? 'none'`
- 新增 `setPriority(id, priority)` 方法

### 修改：`style.css`

```css
--priority-none:      #d1d5db;
--priority-normal:    #3b82f6;
--priority-important: #f59e0b;
--priority-urgent:    #ef4444;
```

### 修改：`stores/locale.js`

中英文各增加 4 条优先级标签文本。

---

## 视觉规格

- **圆点尺寸：** 14px × 14px，`border-radius: 50%`
- **`none` 状态：** 灰色边框，透明背景（空心）
- **其他状态：** 对应颜色实心
- **位置：** checkbox 左侧，垂直居中
- **色盘：** 4 个圆点横排 + 文字标签，白色卡片，`box-shadow` 投影，弹出于圆点正下方（`position: fixed`，坐标由 `getBoundingClientRect()` 计算）
- **done 状态：** 圆点跟随整体 `opacity: 0.45`，不单独处理

---

## 验证清单

- [ ] 新 todo 圆点默认灰色
- [ ] 点击圆点弹出 4 色色盘，含文字标签
- [ ] 选择颜色后圆点变色
- [ ] 刷新页面颜色仍保持（localStorage）
- [ ] 点击色盘外部自动关闭
- [ ] 旧 todo 无 priority 字段时显示灰色圆点（迁移正常）
- [ ] Done 状态 todo 圆点随整体变淡
- [ ] 切换语言后色盘标签同步切换
