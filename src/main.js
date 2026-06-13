import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import App from './App.vue'
import { registerSW } from 'virtual:pwa-register'

const CONFIG_CACHE_NAME = 'todo-config'
const CONFIG_CACHED_AT_KEY = 'appConfigCachedAt'
const CONFIG_CACHED_EVENT = 'app-config-cached'

function getConfigUrl() {
  const configFile = import.meta.env.VITE_APP_CONFIG || 'app.json'
  const url = new URL(import.meta.env.BASE_URL + configFile, window.location.origin)
  return url
}

function applyAppConfig(config) {
  console.log('==> App config: ' + JSON.stringify(config))
  if (config.appName) document.title = config.appName
}

async function fetchNetworkConfig(configUrl) {
  const networkUrl = new URL(configUrl)
  networkUrl.searchParams.set('_cacheBust', Date.now().toString())

  const response = await fetch(networkUrl, { cache: 'no-store' })
  if (!response.ok) throw new Error('!!! Failed to load config: ' + response.status)

  const ct = response.headers.get('content-type') || ''
  if (!ct.includes('json')) throw new Error('!!! Config is not JSON (got: ' + ct + ')')

  const config = await response.json()
  const cachedAt = new Date().toISOString()

  if ('caches' in window) {
    const cache = await caches.open(CONFIG_CACHE_NAME)
    await cache.put(configUrl.toString(), new Response(JSON.stringify(config), {
      headers: { 'Content-Type': 'application/json' },
    }))
  }

  localStorage.setItem(CONFIG_CACHED_AT_KEY, cachedAt)
  window.dispatchEvent(new CustomEvent(CONFIG_CACHED_EVENT, { detail: cachedAt }))

  return config
}

async function fetchCachedConfig(configUrl) {
  if ('caches' in window) {
    const cachedResponse = await caches.match(configUrl.toString())
    if (cachedResponse?.ok) return cachedResponse.json()
  }

  const response = await fetch(configUrl)
  if (!response.ok) throw new Error('!!! Failed to load cached config: ' + response.status)
  return response.json()
}

async function loadAppConfig() {
  const configUrl = getConfigUrl()

  try {
    return await fetchNetworkConfig(configUrl)
  } catch (error) {
    console.warn(error)
    return fetchCachedConfig(configUrl)
  }
}

async function refreshAppConfig() {
  if (!navigator.onLine) throw new Error('offline')
  const config = await fetchNetworkConfig(getConfigUrl())
  applyAppConfig(config)
  return config
}

async function checkForUpdates() {
  if (!navigator.onLine) throw new Error('offline')
  const registration = await navigator.serviceWorker?.getRegistration?.()
  await registration?.update()
  await refreshAppConfig()

  if (registration?.waiting) {
    updateServiceWorker(true)
  }
}

window.todoCheckForUpdates = checkForUpdates

async function bootstrap() {
  try {
    const config = await loadAppConfig()
    applyAppConfig(config)
  } catch (error) {
    console.error(error)
  }

  const app = createApp(App)
  app.use(createPinia())
  app.mount('#app')
}

const updateServiceWorker = registerSW({ immediate: true })

bootstrap()
