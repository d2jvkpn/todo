# Architecture

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | Vue 3 (`<script setup>`) |
| State | Pinia |
| Build | Vite 8 |
| Runtime config | `public/app.json` fetched at bootstrap |
| Persistence | `localStorage` |

## Entry point

`main.js` fetches `app.json` (path configurable via `VITE_APP_CONFIG` env var) before mounting the app, allowing runtime overrides (e.g. `appName`) without a rebuild.

## Component tree

```
App.vue
├── SideMenu.vue        # Side drawer (export / import / language / about)
├── header
│   ├── TodoInput.vue   # Add new todo
│   └── TodoFilter.vue  # Filter tabs: active / done / all
└── main
    └── TodoList.vue    # Scrollable list
        └── PriorityDot.vue  # Per-item priority picker + completion toggle (teleported popover)
```

`App.vue` tracks two CSS custom properties (`--header-h`, `--menu-top`) via `ResizeObserver` so the side menu can align to the input field regardless of header height.

## Stores

### `stores/todos.js`

Single source of truth for all todo data. Synced to `localStorage['todos']` via a deep `watch`.

**Todo shape:**

```js
{ id: string, text: string, status: 'active' | 'done', priority: 'none' | 'normal' | 'important' | 'urgent' }
```

**Migration:** on load, old records using `done: boolean` are normalised to `status`, and missing `priority` fields are defaulted to `'none'`.

**ID generation:** `crypto.randomUUID()` in secure contexts (HTTPS / localhost); timestamp + random suffix over plain LAN HTTP.

**Export:** prefers the File System Access API (`showSaveFilePicker`); falls back to a synthetic `<a>` download.

### `stores/locale.js`

Stores the active locale (`zh` / `en`) in `localStorage['locale']`. Initial value: saved preference → `navigator.language` (zh if starts with `zh`, otherwise `en`). Exposes `t` (a computed message map) and `toggle()`. All user-visible strings are looked up through `t` — no third-party i18n library.

## Data flow

```
User action
  └─► component emits / calls store action
        └─► store mutates todos[]
              └─► watch → localStorage.setItem
                    └─► filteredTodos (computed) rerenders list
```

## Build output

`vite build` writes to `target/dist/` (not the default `dist/`). The dev server binds to `0.0.0.0:3071` so the app is reachable from phones on the same LAN.

## Environment variables

| Variable | Effect |
|----------|--------|
| `VITE_APP_BASE_PATH` | Sets Vite `base` for sub-path deployments |
| `VITE_APP_CONFIG` | Overrides the runtime config filename (default `app.json`) |
