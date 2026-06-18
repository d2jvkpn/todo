import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import App from '@/App.vue'

const CONFIG_CACHE_NAME = 'todo-config'
const CONFIG_CACHED_AT_KEY = 'appConfigCachedAt'
const CONFIG_CACHED_EVENT = 'app-config-cached'

// 根据环境变量决定配置文件路径，支持多环境部署
function getConfigUrl() {
  const configFile = import.meta.env.VITE_APP_CONFIG || 'app.json'
  return new URL(import.meta.env.BASE_URL + configFile, window.location.origin)
}

function applyAppConfig(config) {
  console.log(`==> App config: ${JSON.stringify(config)}`)
  if (config.appName) document.title = config.appName
}

// 始终走网络拉取最新配置，并写入 Cache Storage 供离线回退
async function fetchNetworkConfig(configUrl) {
  const networkUrl = new URL(configUrl)
  networkUrl.searchParams.set('_cacheBust', Date.now().toString())  // 绕过 HTTP 缓存

  const response = await fetch(networkUrl, { cache: 'no-store' })
  if (!response.ok) throw new Error(`!!! Failed to load config: ${response.status}`)

  const ct = response.headers.get('content-type') || ''
  if (!ct.includes('json')) throw new Error(`!!! Config is not JSON (got: ${ct})`)

  const config = await response.json()
  const cachedAt = new Date().toISOString()

  // 写入 Cache Storage，供离线时回退读取；Safari 私有模式下 caches 不可用，需降级
  if ('caches' in window) {
    const cache = await caches.open(CONFIG_CACHE_NAME)  // 打开（或创建）专属缓存桶
    await cache.put(configUrl.toString(), new Response(JSON.stringify(config), {
      headers: { 'Content-Type': 'application/json' },
    }))
  }

  localStorage.setItem(CONFIG_CACHED_AT_KEY, cachedAt)
  window.dispatchEvent(new CustomEvent(CONFIG_CACHED_EVENT, { detail: cachedAt }))

  return config
}

// 离线或网络失败时的降级路径：先查 Cache Storage，再走 SW 缓存兜底
async function fetchCachedConfig(configUrl) {
  // 优先从 Cache Storage 读取离线副本
  if ('caches' in window) {
    const cachedResponse = await caches.match(configUrl.toString())
    if (cachedResponse?.ok) return cachedResponse.json()
  }

  // Cache Storage 未命中时降级走网络（Service Worker 可能拦截并返回缓存）
  const response = await fetch(configUrl)
  if (!response.ok) throw new Error(`!!! Failed to load cached config: ${response.status}`)
  return response.json()
}

// 启动时加载配置：优先缓存（立即返回），失败时降级到网络
async function loadAppConfig() {
  const configUrl = getConfigUrl()

  try {
    return await fetchCachedConfig(configUrl)
  } catch (error) {
    console.warn(error)
    return fetchNetworkConfig(configUrl)
  }
}

// 在线时强制拉取最新配置并立即生效
async function refreshAppConfig() {
  if (!navigator.onLine) throw new Error('offline')
  const config = await fetchNetworkConfig(getConfigUrl())
  applyAppConfig(config)
  return config
}

// 检查 SW 和配置是否有新版本，并在有新 SW 时立即激活它（跳过 waiting 阶段）
async function checkForUpdates() {
  if (!navigator.onLine) throw new Error('offline')
  // getRegistration 在不支持 SW 的环境（如 file:// 或隐私模式）返回 undefined，用 ?. 防御
  const registration = await navigator.serviceWorker?.getRegistration?.()
  await registration?.update()   // 触发浏览器重新请求 SW 脚本，若有变化则下载新版本
  await refreshAppConfig()

  // update() 后若存在 waiting 的新 SW，说明新版本已就绪；由 App.vue 注册的处理函数激活
  if (registration?.waiting) {
    window.todoUpdateServiceWorker?.(true)
  }
}

// 暴露给 UI 层调用（如"检查更新"按钮）
window.todoCheckForUpdates = checkForUpdates

// SW 注册由 App.vue 通过 useRegisterSW({ immediate: true }) 完成；
// registerType: 'prompt' 使新 SW 停在 waiting 状态，由 App.vue 弹出提示后再激活。
// updateServiceWorker 挂载到 window.todoUpdateServiceWorker 供 checkForUpdates 调用。

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

  // 后台静默刷新配置，不阻塞首屏
  fetchNetworkConfig(getConfigUrl()).then(applyAppConfig).catch(() => {})
}

bootstrap()
