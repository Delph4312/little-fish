import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import { registerLazyBg } from './directives/lazyBg'
import { preloadAllImages } from './data/images'
import './assets/style.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)
registerLazyBg(app)
app.mount('#app')

// 后台预热所有图片到浏览器缓存，之后各处图片均秒开
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => preloadAllImages(), { once: true })
}
