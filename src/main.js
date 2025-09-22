import { createApp } from 'vue'
import { createPinia } from 'pinia'
import {Quasar} from 'quasar'

import App from './App.vue'
import { router } from './router/index.js'
import { useAuth } from './stores/store.js'

// Import icon libraries
import '@quasar/extras/material-icons/material-icons.css'

// Import Quasar css
import 'quasar/src/css/index.sass'

const myApp = createApp(App)
const pinia = createPinia()

myApp.use(pinia)
myApp.use(router)
myApp.use(Quasar, {
    plugins: {}, // Import Quasar plugins here if needed
})

// Inicializar autenticación antes de montar la app
const authStore = useAuth()
authStore.loadStoredAuth()

console.log('App inicializada. Estado de autenticación:', {
    isAuthenticated: authStore.isAuthenticated(),
    userProfile: authStore.userProfile,
    hasToken: !!authStore.token
})

myApp.mount('#app')
