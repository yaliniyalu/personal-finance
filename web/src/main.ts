import './assets/main.css'
import 'virtual:uno.css'

import { createApp } from 'vue'
import PrimeVue from 'primevue/config'
import DialogService from 'primevue/dialogservice'
import Aura from '@primeuix/themes/aura'
import 'primeicons/primeicons.css'
import { createNotivue } from 'notivue'
import 'notivue/notification.css'
import 'notivue/animations.css'

import App from './App.vue'
import router from './router'

createApp(App)
  .use(router)
  .use(createNotivue())
  .use(PrimeVue, {
    theme: {
      preset: Aura,
      options: {
        darkModeSelector: '.dark',
      },
    },
  })
  .use(DialogService)
  .mount('#app')
