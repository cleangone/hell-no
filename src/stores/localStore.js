import { computed } from 'vue'
import { defineStore } from 'pinia'
import { Timestamp } from "firebase/firestore"
import { useLocalStorage } from '@vueuse/core'
import { DefaultWall } from '@/utils/constants'

/*
   Local storage
      site-wall - {}
      my-wall - {}
      recent-items - []
      device-id
      solo-mode - boolean
*/

export const useLocalStore = defineStore('local', () => {
   const siteWallLocal = useLocalStorage('site-wall', DefaultWall)
   const siteWall = computed(() => fixDates(siteWallLocal.value))
   function setSiteWall(wall) { siteWallLocal.value = wall }
   
   const myWallLocal = useLocalStorage('my-wall', DefaultWall)
   const myWall = computed(() => fixDates(myWallLocal.value))
   function setMyWall(wall) { myWallLocal.value = wall }
   
   const recentItemsLocal = useLocalStorage('recent-items', [])
   const recentItems = computed(() => fixObjs(recentItemsLocal.value))
   function setRecentItems(items) { recentItemsLocal.value = items }
   
   const deviceId = useLocalStorage('device-id', null)
   function setDeviceId(id) { deviceId.value = id }

   const soloMode = useLocalStorage('solo-mode', false)
   function setSoloMode(solo) { soloMode.value = solo }

   function fixObjs(localObjs) {
      const objs = []
      for (const localObj of localObjs) {
         objs.push(fixDates(localObj))
      }
      return objs
   }

   // local storage serialization recreates date but not the object w methods
   function fixDates(obj) { 
      const clone = { ...obj }
      clone.dateCreated  = getTimestamp(clone.dateCreated)
      clone.dateModified = getTimestamp(clone.dateModified)
      if (clone.dateContentModified) { clone.dateContentModified = getTimestamp(clone.dateContentModified) }
      return clone
   }

   function getTimestamp(dateObj) { return new Timestamp(dateObj.seconds, dateObj.nanoseconds) }
   
   return { 
      siteWall, setSiteWall, myWall, setMyWall,
      recentItems, setRecentItems, deviceId, setDeviceId, soloMode, setSoloMode 
   }
})
