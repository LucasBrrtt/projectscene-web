import 'bootstrap/dist/css/bootstrap.min.css'
import './assets/main.css'

import { createApp } from 'vue'

import App from '@/app/App/App.vue'
import router from '@/router'

// Cria a instancia raiz da aplicacao e registra o roteador
// antes de montar o app no elemento principal do HTML.
const app = createApp(App)

app.use(router)

app.mount('#app')
