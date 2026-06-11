# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project layout

```
todo/        # Vue 3 + Vite app (all dev work happens here)
docs/        # Design specs, plans, and learning notes
```

All commands below must be run from inside `todo/`.

## Commands

```bash
npm run dev      # Start dev server on port 3071 (LAN-exposed, phone-accessible)
npm run build    # Production build → todo/dist/
npm run preview  # Serve the production build locally
```

No test runner or linter is configured yet.

## Mobile preview

`vite.config.js` sets `host: true` and `port: 3071`. Running `npm run dev` exposes the server on the local network — open the `Network:` URL shown in the terminal on a phone connected to the same WiFi.

## Architecture

Vue 3 SFCs using `<script setup>` throughout. State management via Pinia with `watch`-based localStorage sync.

```
stores/todos.js          # Pinia store: todos[], filter; syncs to localStorage['todos']
stores/locale.js         # i18n store: zh/en
components/TodoInput.vue # Add new todo
components/TodoFilter.vue# Filter tabs: active / done / all
components/TodoList.vue  # List with toggle, inline edit (double-click), delete
components/SideMenu.vue  # Side drawer: export, import, language, about
```

See `docs/todo-app-design.md` for the full design spec.
See `docs/superpowers/plans/2026-06-11-todo-app.md` for the implementation plan.

## Memory

Project-specific guidance is stored in `docs/memory/`:

- [No auto-commit](docs/memory/feedback_no_auto_commit.md) — Never commit automatically; wait for explicit user request
