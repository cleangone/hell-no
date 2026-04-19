import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { breakpointsTailwind, useBreakpoints } from '@vueuse/core'
import { useUserStore }    from '@/stores/userStore'
import { useItemMgr }      from '@/stores/itemMgr'
import { useGalleryMgr }   from '@/stores/galleryMgr'
import { useWallStore }    from '@/stores/wallStore'
import { useHitStore }     from '@/stores/hitStore'
import { useViewStore }    from '@/stores/viewStore'
import { useLocalStore }   from '@/stores/localStore'
import { dateUuid, isHidden, isInvisible, isOwned, isPublic } from '@/utils/utils'  
   
export const useViewMgr = defineStore('viewMgr', () => {   
   const breakpoints = useBreakpoints(breakpointsTailwind)
   const xs = breakpoints.smaller('sm')
   const userStore    = useUserStore()
   const itemMgr      = useItemMgr()
   const galleryMgr   = useGalleryMgr()
   const wallStore    = useWallStore()
   const hitStore     = useHitStore()
   const viewStore    = useViewStore()
   const localStore   = useLocalStore()
   
   function init() {
      // console.log("viewMgr.init")
      if (!viewStore.isInitialized) {
         viewStore.init()

         let deviceId = localStore.deviceId
         // console.log("localStore.deviceId", deviceId)
         if (!deviceId) {
            deviceId = dateUuid()
            // console.log("localStore.setDeviceId", deviceId)
            localStore.setDeviceId(deviceId)
         }
         viewStore.setDeviceId(deviceId)

         // preload walls for Home 
         wallStore.siteWall
         if (userStore.userExists) { wallStore.myWall }
      }
   }

   const isStandalone = computed(() => window.matchMedia('(display-mode: standalone)').matches)
   const isXs         = computed(() => xs.value)
   const isMobile     = computed(() => {
         const iosDevice = navigator.userAgent.match(/iPhone|iPad|iPod/) // ipad no longer matches
         const mobile = xs.value || (isStandalone.value && iosDevice != null)
         // logStore.jsonInfo("deviceInfo",
            // { standalone: isStandalone.value, iosDevice: iosDevice, isMobile: mobile })
         return mobile
   })
   const isDeskTop = computed(() => !isMobile.value)
   const solo = computed(() => { 
      // logStore.info("viewMgr.soloMode " + localStore.soloMode)
      return localStore.soloMode
   })

   // can nav directly to INVISIBLE item even though thumb/link not visible, but HIDDEN items never visible
   function itemIsVisibleToUser(item)    { return itemThumbVisibleToUser(item) || isInvisible(item) }
   function itemThumbVisibleToUser(item) { return isPublic(item) || item.onUserWall || (isOwned(item, userStore.userId) && !isHidden(item)) }
      
   // can nav directly to INVISIBLE gallery even though thumb/link not visible
   function galleryIsVisibleToUser(gallery)    { return galleryThumbVisibleToUser(gallery) || isInvisible(gallery)}
   function galleryThumbVisibleToUser(gallery) { return isPublic(gallery) || isOwned(gallery, userStore.userId) }

   const hitIds = ref([])
   function addHit(itemId) {
      if (!hitIds.value.includes(itemId)) {
         hitIds.value.push(itemId)
         hitStore.addHit(itemId)
      }
      if (hitIds.value.length == 1) {
         setTimeout(function() { 
            // console.log("viewMgr hits reset")
            hits.value = [] 
         }, 1000 * 60 * 60) // reset after an hour
      }
   }

   function galleryItemCount(gallery) {
      const itemIds = new Set()
      for (const item of galleryMgr.uniqueItems(gallery) ) {
         if (itemIsVisibleToUser(item)) { 
            if (itemMgr.isItemGroup(item)) { 
               for (const childItem of item.childItems) { 
                  itemIds.add(childItem.id)
               }
            }
            else { itemIds.add(item.id) }
         }
      } 
      return itemIds.size
   }
      
   return { init, isMobile, isXs, isDeskTop, solo, addHit, itemIsVisibleToUser, itemThumbVisibleToUser, 
      galleryIsVisibleToUser, galleryThumbVisibleToUser, galleryItemCount }
})
