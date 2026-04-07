import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
   plugins: [
      vue(),
      VitePWA({
         registerType: 'autoUpdate',
         devOptions: { enabled: true },
         injectRegister: 'auto',
         // includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
         includeAssets: ['**/*'],
         manifest: {
            name: 'Hell-No Gallery',
            short_name: 'Hell-No',
            description: 'Hell-No Gallery',
            display: "standalone",
            theme_color: '#ffffff',
            icons: [
               {
                  src: 'icons/192x192.png',
                  sizes: '192x192',
                  type: 'image/png'
               },
               {
                  src: 'icons/512x512.png',
                  sizes: '512x512',
                  type: 'image/png',
                  purpose: 'any maskable'
               }
            ]
         },
         workbox: {
            cleanupOutdatedCaches: false,
            importScripts: ["firebase-messaging-sw.js"],
            globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg}'],
            runtimeCaching: [
               {
                  urlPattern: /^localhost/,
                  handler: 'NetworkFirst',
               },
               {
                  // https://hell-no.gallery/
                  urlPattern: /^https:\/\/hell-no\.gallery/,
                  handler: 'NetworkFirst',
                  options: { 
                     cacheName: 'hell-no-cache',
                  }
               },
               {  
                  // https://www.google.com
                  urlPattern: /^https:\/\/www\.google\.com/,
                  handler: 'NetworkFirst',
                  options: { 
                     cacheName: 'google-cache',
                     cacheableResponse: { statuses: [0, 200] }
                  }
               },
               // {
               //    // https://firestore.googleapis.com
               //    urlPattern: ({ url }) => { return url.hostname == "firestore.googleapis.com" },
               //    // urlPattern: /^https:\/\/firestore\.googleapis\.com/,
               //    handler: 'NetworkFirst',
               //    options: { 
               //       cacheName: 'firestore-cache',
               //       cacheableResponse: { statuses: [0, 200] }
               //    }
               // },
               // {
               //    //  https://identitytoolkit.googleapis.com
               //    urlPattern: /^https:\/\/identitytoolkit\.googleapis\.com/,
               //    handler: 'NetworkFirst',
               //    options: { 
               //       cacheName: 'identity-cache',
               //       cacheableResponse: { statuses: [0, 200] }
               //    }
               // },
               {
                  //  https://securetoken.googleapis.com
                  urlPattern: /^https:\/\/securetoken\.googleapis\.com/,
                  handler: 'NetworkFirst',
                  options: { 
                     cacheName: 'token-cache',
                     cacheableResponse: { statuses: [0, 200] }
                  }
               },
               {
                  // https://firebasestorage.googleapis.com/v0/b/gallery-a1fcb.appspot.com/
                  urlPattern: ({ url }) => { 
                     return url.hostname == "firebasestorage.googleapis.com" && 
                            url.pathname.startsWith("/v0/b/gallery-a1fcb.appspot.com") &&
                            !url.pathname.includes("&random=") 
                  },
                  // urlPattern: /^https:\/\/firebasestorage\.googleapis\.com\/v0\/b\/gallery-a1fcb\.appspot\.com/,
                  handler: 'CacheFirst',
                  options: {
                     cacheName: 'image-cache',
                     cacheableResponse: { statuses: [0, 200] },
                     expiration: {
                        maxEntries: 1000,
                        maxAgeSeconds: 60 * 60 * 24 * 365 // 365 days
                     }
                  }
               },
            ]
         }
      })
   ],
   resolve: {
      alias: {
         '@': fileURLToPath(new URL('./src', import.meta.url))
      }
   }
})
