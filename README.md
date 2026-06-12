# Todo App

A minimal mobile-first todo app built with Vue 3 + Vite + Pinia. Supports priority levels, bilingual UI (Chinese / English), import/export, and works offline as a PWA.

[中文文档](README.cn.md)

## Screenshots

<p align="center">
  <img src="docs/demo/a01.jpg" width="260" alt="Todo list">
  <img src="docs/demo/a02.jpg" width="260" alt="Priority picker">
  <img src="docs/demo/a03.jpg" width="260" alt="Side menu">
</p>

## Getting started

```bash
npm install
npm run dev        # dev server on port 3071, accessible over LAN
```

After starting, the terminal prints a `Network:` URL — any phone on the same Wi-Fi can open it directly.

## Build

```bash
npm run build      # production build → target/dist/
npm run preview    # preview the production build locally
```

## Features

- Add, edit (double-tap), and delete todos
- Four priority levels with colour-coded dots — None / Normal / Important / Urgent
- Filter by status: Active / Done / All
- Side menu: export JSON, import JSON, check for updates, theme, language, about
- Theme: System / Light / Dark (persisted)
- Chinese / English UI (auto-detected from browser locale)
- PWA — installable, works offline (Workbox pre-cache + Cache API for runtime config)
- Data persisted to `localStorage`; survives page refresh

## Stack

- Vue 3 `<script setup>` SFC
- Vite 8
- Pinia (state management, persisted to localStorage)
- `vite-plugin-pwa` + Workbox
