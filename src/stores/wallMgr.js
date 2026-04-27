import { computed } from 'vue'
import { defineStore } from 'pinia'
import { useUserStore } from '@/stores/userStore'
import { useWallStore } from '@/stores/wallStore'
import { useItemStore } from '@/stores/itemStore'
import { useItemMgr }   from '@/stores/itemMgr'
import { randomizeArray } from '@/utils/utils'
import { Defaults, ItemType, WallType } from '@/utils/constants' 
 
export const useWallMgr = defineStore('wallMgr', () => { 
   const userStore = useUserStore()
   const wallStore = useWallStore()
   const itemStore = useItemStore()
   const itemMgr   = useItemMgr()
   
   function name(wall) { 
      if (wall.type == WallType.SITE) { return "Site" }
      else if (wall.type == WallType.USER) { return userStore.getUsername(wall.id)  }
      return ""
   }

   const filledSiteWall = computed(() => {
      // add a selection of existing user wall items 
      const siteCopy = { ...wallStore.siteWall }
      siteCopy.userWallItems = [ ...wallStore.userWallItems ]
      // siteCopy.userWallItems = randomizeArray(wallStore.userWallItems)
      // const firstWallItems = userWallItems.slice(0, 5)
      // siteCopy.wallItems = firstWallItems
      
      // fill wall with current - userWallItems will be mixed in later

      
      return fillWall(siteCopy, itemMgr.recentPublicItems) 
   })

   function fillWall(wall, items) { 
      const maxItems = wall.maxWallItems ? wall.maxWallItems : Defaults.MAX_WALL_ITEMS
      const wallItemIds = wall.wallItems.map((obj) => obj.itemId)

      const filledWall = { ...wall }
      filledWall.wallItems     = [ ...wall.wallItems ]
      if (wall.userWallItems) { filledWall.userWallItems = [ ...wall.userWallItems ] }
      
      const randomUngroupedItems = [ ...itemMgr.ungroupItems(items) ]
      for (const item of randomUngroupedItems) { 
         item.random = Math.floor(Math.random() * 1000) 
      }
      randomUngroupedItems.sort(function(a, b){return b.random - a.random}) 

      for (const ungroupedItem of randomUngroupedItems) { 
         if (filledWall.wallItems.length >= maxItems) { break }
         
         // workaround - having issues with actual ungrouped item not having a primaryImage
         if (!wallItemIds.includes(ungroupedItem.id) && ungroupedItem.type == ItemType.SINGLE) {
            const wallItem = { ...ungroupedItem }
            const imageItem = itemMgr.extractFromItemGroup(ungroupedItem)
            wallItem.name = imageItem.name
            // console.log("Filling wall", wallItem)
            filledWall.wallItems.push(wallStore.createWallItem(wallItem, imageItem.primaryImage))
         }
      }
      return filledWall
   }

   function userWallIncludesItem(userId, itemId) { 
      const wall = wallStore.getUserWall(userId)
      if (!wall?.wallItems?.length) { return false }

      const itemIds = wall.wallItems.map(a => a.itemId) 
      return itemIds.includes(itemId) 
   }   

   function deleteWallItem(wallItem, wallId) { 
      wallStore.removeWallItem(wallItem.itemId, wallId) 
      itemStore.updateItem({ id: wallItem.itemId, onUserWall: false })
   }
   
   return { name, filledSiteWall, fillWall, userWallIncludesItem, deleteWallItem }
})

