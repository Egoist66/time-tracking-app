import { createApp } from 'vue'
import { createPinia } from 'pinia'

import './styles/transition.scss'
import './styles/style.css'

import App from './App.vue'
import router from './routes'

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')
