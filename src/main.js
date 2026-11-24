import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import { registerLazyBg } from './directives/lazyBg'
import './assets/style.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)
registerLazyBg(app)
app.mount('#app')
