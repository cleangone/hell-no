import { createApp } from 'vue'
import { setLogLevel } from "firebase/firestore"
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import { aliases, mdi } from 'vuetify/iconsets/mdi'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { createHead } from '@unhead/vue'
import "@mdi/font/css/materialdesignicons.css"
import CKEditor from "@ckeditor/ckeditor5-vue"
import VueGtag from 'vue-gtag'
import { Route } from '@/utils/constants'
import { GoogleAnalyticsConfig } from '@/config/config'
import './assets/main.css'

// setLogLevel("debug") 

const app = createApp(App)
const vuetify = createVuetify({ 
   components, 
   directives, 
   icons: { defaultSet: 'mdi', aliases, sets: { mdi } } 
})

const errorRegex = /img is null|^. is null|^. is not defined/   // "s is null"
// app.config.errorHandler = (err, vm, info) => {
//    if (err.message.match(errorRegex)) { 
//       console.log("Known Error: " + err.name + " - " + err.message) 
//    }
//    else {
//       logStore.addError("app.config.errorHandler Error: " + err.name + " - " + err.message)
    
//       // console.log("Routing to Home on error")
//       // router.push(Route.HOME.url)        
//    } 
// }

app.use(createPinia())
app.use(router)
app.use(createHead())
app.use(vuetify)
app.use(CKEditor)
app.use(VueGtag, { config: { id: GoogleAnalyticsConfig.measurementID }}, router)

app.mount('#app')
   