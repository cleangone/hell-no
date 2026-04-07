import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { breakpointsTailwind, useBreakpoints } from '@vueuse/core'
import { useUserStore }    from '@/stores/userStore'
import { useItemStore }    from '@/stores/itemStore'
import { useItemMgr }      from '@/stores/itemMgr'
import { useGroupStore }   from '@/stores/groupStore'
import { useGalleryStore } from '@/stores/galleryStore'
import { useGalleryMgr }   from '@/stores/galleryMgr'
import { useWallStore }    from '@/stores/wallStore'
import { useHitStore }     from '@/stores/hitStore'
import { useViewStore }    from '@/stores/viewStore'
import { useLocalStore }   from '@/stores/localStore'
import { dateUuid, isGroup, isHidden, isPublic } from '@/utils/utils'  
   
export const useViewMgr = defineStore('viewMgr', () => {   
   const breakpoints = useBreakpoints(breakpointsTailwind)
   const xs = breakpoints.smaller('sm')
   const userStore    = useUserStore()
   const itemStore    = useItemStore()
   const itemMgr      = useItemMgr()
   const groupStore   = useGroupStore()
   const galleryStore = useGalleryStore()
   const galleryMgr   = useGalleryMgr()
   const wallStore    = useWallStore()
   const hitStore     = useHitStore()
   const viewStore    = useViewStore()
   const localStore   = useLocalStore()
   
   function init() {
      console.log("viewMgr.init")
      if (!viewStore.isInitialized) {
         viewStore.init()

         let deviceId = localStore.deviceId
         // console.log("localStore.deviceId", deviceId)
         if (!deviceId) {
            deviceId = dateUuid()
            console.log("localStore.setDeviceId", deviceId)
            localStore.setDeviceId(deviceId)
         }
         viewStore.setDeviceId(deviceId)

         // preload walls for Home 
         wallStore.siteWall
         if (userStore.userExists) { wallStore.myWall }
      }
   }

   const isStandalone = computed(() => window.matchMedia('(display-mode: standalone)').matches)
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
   
   function itemIsVisibleToUser(item) {
      // console.log("itemIsVisibleToUser", item)
      const visibility = viewStore.getVisiblity(item)
      if (visibility) { return visibility.isVisible }
   
      if (isPublic(item) || item.onUserWall) { return viewStore.setVisiblity(item, true) }
      else if (isHidden(item)) { return viewStore.setVisiblity(item, false)} 
      else if (userOwns(item)) { return viewStore.setVisiblity(item, true) }
      else if (isGroup(item)) {
         const isVisible = userInGroups(item.groupIds)
         if (!isVisible) { console.log("Group item " + item.name +  " not visible") } 
         return viewStore.setVisiblity(item, isVisible)
      } 

      return viewStore.setVisiblity(item, false)
   }

   // check that gallery is visible and contains at least one visible item or childGallery
   function galleryIsVisibleToUser(gallery) {
      // console.log("galleryIsVisibleToUser", gallery)
      if (gallery && (isPublic(gallery) || userOwns(gallery))) {
         // first do a quick id-only check to see if there is a previously-viewed visible items
         for (const itemId of gallery.itemIds) {
            const visibility = viewStore.getIdVisiblity(itemId)
            // console.log("galleryIsVisibleToUser - itemId", visibility)
            if (visibility && visibility.isVisible) { 
               // console.log(gallery.name  + " visibleToUser - on id check")
               return true }
         }

         // default to a full check, which will also populate visibility 
         for (const itemId of gallery.itemIds) {
            const item = itemStore.getItem(itemId)
            if (item) {
               // console.log("galleryIsVisibleToUser.item", item)
               const isVisibile = itemIsVisibleToUser(item)
               // console.log(item.name + " visibleToUser.isVisibile", isVisibile)
               if (isVisibile) { return isVisibile }
            }
         }
         
         for (const childGalleryId of gallery.childGalleryIds) {
            const childGallery = galleryStore.getGallery(childGalleryId)
            if (galleryIsVisibleToUser(childGallery)) { return true }
         }
      } 

      return false
   }

   const hitIds = ref([])
   function addHit(itemId) {
      if (!hitIds.value.includes(itemId)) {
         hitIds.value.push(itemId)
         hitStore.addHit(itemId)
      }
      if (hitIds.value.length == 1) {
         setTimeout(function() { 
            console.log("viewMgr hits reset")
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
      
   function userOwns(object) { return userStore.userId == object.userId }
   function userInGroups(groupIds) { return groupStore.getUserIds(groupIds).includes(userStore.userId) }
   
   return { init, isMobile, isDeskTop, solo, addHit, itemIsVisibleToUser, galleryIsVisibleToUser, galleryItemCount }
})
