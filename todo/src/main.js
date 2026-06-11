import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import App from './App.vue'

async function loadAppConfig() {
  const configFile = import.meta.env.VITE_APP_CONFIG || 'app.json'
  const configUrl = new URL(configFile, window.location.origin + import.meta.env.BASE_URL)
  const response = await fetch(configUrl)
  if (!response.ok) throw new Error('!!! Failed to load config: ' + response.status)
  return response.json()
}

async function bootstrap() {
  try {
    const config = await loadAppConfig()
    console.log(`==> App config: ${JSON.stringify(config)}`)
    if (config.appName) document.title = config.appName
  } catch (error) {
    console.error(error)
  }

  const app = createApp(App)
  app.use(createPinia())
  app.mount('#app')
}

bootstrap()
