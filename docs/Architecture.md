# Architecture

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | Vue 3 (`<script setup>`) |
| State | Pinia |
| Build | Vite 8 |
| PWA | `vite-plugin-pwa` (Workbox) |
| Runtime config | `public/app.json` fetched at bootstrap |
| Persistence | `localStorage` (`todos`, `locale`, `theme`, `appConfigCachedAt`) |

## Entry point

`main.js` loads `app.json` (path configurable via `VITE_APP_CONFIG`) before mounting. Strategy: **network-first** (cache-busted via `?_cacheBust`, bypasses HTTP cache), writing through to the **Cache API** bucket `todo-config`; falls back to the Cache API entry on network failure. On each successful fetch, the timestamp is saved to `localStorage['appConfigCachedAt']` and broadcast via the custom event `app-config-cached` so `SideMenu.vue` can update the displayed time without a reload.

## Component tree

```
App.vue
├── SideMenu.vue        # Side drawer (export / import / check-updates / theme / language / about)
├── header
│   ├── TodoInput.vue   # Add new todo
│   └── TodoFilter.vue  # Filter tabs: active / done / all
└── main
    └── TodoList.vue    # Scrollable list
        └── PriorityDot.vue  # Per-item priority picker + completion toggle (teleported popover)
```

`App.vue` tracks two CSS custom properties (`--header-h`, `--menu-top`) via `ResizeObserver` so the side menu can align to the input field regardless of header height. It also instantiates `useThemeStore()` at setup time to apply the saved theme before first render.

The app header title row uses `justify-content: center` with the menu icon `position: absolute; left: 0`, so the "TODO" heading is always centred regardless of icon width.

## Stores

### `stores/theme.js`

Manages the active colour scheme. Persists to `localStorage['theme']`. Initial value: saved preference → `'system'`.

```js
state:   { theme: 'system' | 'light' | 'dark' }
```

On load and on every change, applies the value to `document.documentElement`:

- `'system'` → removes `data-theme` attribute (CSS falls back to `prefers-color-scheme`)
- `'light'` / `'dark'` → sets `data-theme="light"` / `data-theme="dark"`

Instantiated in `App.vue` (`useThemeStore()`) so the attribute is set before the first render.

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

`t` includes About-modal fields (`techs`, `version`, `repository`, `cachedLabel`, `configCachedTime`, `configCachePending`), theme labels (`theme`, `themeSystem`, `themeLight`, `themeDark`), and update-flow strings (`checkUpdates`, `checkingUpdates`, `updateSuccess`, `updateFailed`, `updateOffline`) in addition to the core UI strings.

## Data flow

```
User action
  └─► component emits / calls store action
        └─► store mutates todos[]
              └─► watch → localStorage.setItem
                    └─► filteredTodos (computed) rerenders list
```

## Theming

All colours are CSS custom properties on `:root`. Light mode (default):

| Variable | Value | Role |
|----------|-------|------|
| `--bg` | `#f2f2f7` | Page background (silver) |
| `--surface` | `#ffffff` | Drawers, panels, modals |
| `--text` | `#6b7280` | Body text |
| `--text-h` | `#111827` | Headings, list items |
| `--border` | `#e5e5ea` | Dividers, card borders |
| `--accent` | `#1c1c1e` | Buttons, active states |
| `--accent-bg` | `rgba(0,0,0,0.06)` | Subtle fills |
| `--accent-border` | `rgba(0,0,0,0.22)` | Outlined accents |

Dark mode overrides the same variables with purple-accent values (`--accent: #c084fc`). Dark vars are applied in two ways so forced dark and system dark both work:

```css
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]):not([data-theme="dark"]) { … }
}
:root[data-theme="dark"] { … }
```

The `--surface` variable separates elevated surfaces (drawers, modals) from the page background in both modes.

## Build output

`vite build` writes to `target/dist/` (not the default `dist/`). The dev server binds to `0.0.0.0:3071` so the app is reachable from phones on the same LAN.

## PWA & Update flow

The app is a Progressive Web App built with `vite-plugin-pwa` (`registerType: 'autoUpdate'`). Workbox pre-caches all `*.{js,css,html,ico,png,svg,json}` assets at build time.

**Service worker registration** — `main.js` calls `registerSW({ immediate: true })` (from `virtual:pwa-register`) and stores the returned `updateServiceWorker` callback.

**`checkForUpdates()`** — exposed as `window.todoCheckForUpdates`, called from `SideMenu.vue`:

1. Calls `registration.update()` to download a fresh SW if available.
2. Re-fetches and re-applies `app.json` via `refreshAppConfig()`.
3. If `registration.waiting` is non-null after the update, calls `updateServiceWorker(true)` to activate the new SW immediately (skips waiting for tabs to close).

`SideMenu.vue` shows the "Check for updates" item as disabled while in-flight (`checkingUpdates` ref). The outcome is shown in the shared alert modal with one of three messages: success, offline, or failed.

**App config cache:**

| Key / API | Value | Purpose |
|-----------|-------|---------|
| Cache API bucket `todo-config` | serialised `app.json` | offline fallback for config |
| `localStorage['appConfigCachedAt']` | ISO timestamp string | displayed in About modal |
| custom event `app-config-cached` | `detail` = ISO timestamp | notifies `SideMenu` to re-render the cached-at time live |

## Environment variables

| Variable | Effect |
|----------|--------|
| `VITE_APP_BASE_PATH` | Sets Vite `base` for sub-path deployments |
| `VITE_APP_CONFIG` | Overrides the runtime config filename (default `app.json`) |
