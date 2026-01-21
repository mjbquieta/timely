import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import './assets/main.css'

// Import components for global registration
import AppHeader from './components/AppHeader.vue'
import DataTable from './components/DataTable.vue'
import PageLayout from './components/PageLayout.vue'

const app = createApp(App)

// Register components globally
app.component('AppHeader', AppHeader)
app.component('DataTable', DataTable)
app.component('PageLayout', PageLayout)

app.use(createPinia())
app.use(router)

app.mount('#app')
