import { computed } from 'vue'
import { defineStore } from 'pinia'
import { useWindowSize } from '@vueuse/core'
import { useUserStore } from '@/stores/userStore'
import { useItemStore } from '@/stores/itemStore'
import { dateUuid, objAspectRatio } from '@/utils/utils'
import { ItemNavAction, ItemType, State, URL } from '@/utils/constants'
   
export const useItemMgr = defineStore('itemMgr', () => {   
   const { width: windowWidth, height: windowHeight } = useWindowSize()
   const userStore = useUserStore()
   const itemStore = useItemStore()   
   
   const myItemIdToItem = computed(() => { 
      return itemStore.myItems ? new Map(itemStore.myItems.map((obj) => [obj.id, obj])) : new Map() 
   })

   const artistIdToMyItemIds = computed(() => { 
      const artistIdToItemIds = new Map() 
      if (itemStore.myItems) {
         for (const item of itemStore.myItems) { 
               if (item.primaryArtist) {
                  const itemIds = artistIdToItemIds.get(item.primaryArtist.id)
                  if (itemIds) { itemIds.push(item.id) }
                  else { artistIdToItemIds.set(item.primaryArtist.id, [ item.id ]) } 
               }
         }
      }
      return artistIdToItemIds
   })
   
   const recentPublicItems      = computed(() => { return extractRecentItems(itemStore.publicItems) })
   const recentGroupMemberItems = computed(() => { return extractRecentItems(itemStore.myGroupMemberItems) })
   const myRecentItems          = computed(() => { return extractRecentItems(itemStore.myItems) })
   function getRecentItems(userId)               { return extractRecentItems(itemStore.getUserItems(userId)) }
   function getRecentPublicItems(userId)         { return extractRecentItems(itemStore.getUserPubicItems(userId)) }
   
   function extractRecentItems(items) { 
      if (!items) { return [] }
      const sortedItems = []
      for (const item of items) { 
         if (item.dateContentModified) { sortedItems.push(item) } // work around for old items w/o dateContentModified
      }
      sortedItems.sort(function(a, b){return b.dateContentModified - a.dateContentModified}) 
      
      // return items less than 2 months old or at least 20 items
      const cutoffDate = new Date()
      cutoffDate.setMonth(cutoffDate.getMonth() - 2)
      const recentItems = []
      for (const item of sortedItems) { 
         if (item.dateModified.toDate() > cutoffDate || recentItems.length < 20) { recentItems.push(item) }
         else { break }
      }

      return recentItems
   }
   
   function isItemGroup(item) { return item.type == ItemType.GROUP }
   function itemAspectRatio(item) { 
      // console.log("itemAspectRatio", item)
      if (item.childItems) {
         let totalWidth = 0
         let totalHeight = 0
         for (const childItem of item.childItems) { 
            totalWidth += childItem.primaryImage.dimensions.width
            totalHeight += childItem.primaryImage.dimensions.height
         }
         return totalWidth / (totalHeight / item.childItems.length)  // totalWidth/avgHeight
      }
      else { return objAspectRatio(item.primaryImage.dimensions) }
   }
   
   function createItemImage(imageType, subDir = null) {
      const itemImage = { id: dateUuid(), imageType: imageType } 
      const dir = "images/" + (subDir ? subDir + "/" : "")
      itemImage.filePath = dir + itemImage.id 
      itemImage.thumbFilePath = itemImage.filePath + "_300x300"
      itemImage.largeThumbFilePath = itemImage.filePath + "_600x600"
      
      return itemImage
   }

   function ungroupItems(items) { 
      const ungroupedItems = []
      for (const item of items) { 
        ungroupedItems.push(...ungroupItem(item))
      }    
      return ungroupedItems
   }

   // an ungrouped item uses its parent's id and adds a childNum
   // it still has all childItems, and can be displayed as a groupItem
   function ungroupItem(item) { 
      const ungroupedItems = []
      if (isItemGroup(item)) { 
         if (item.childNum) { ungroupedItems.push(item) }
         else {
            for (let i=0; i<item.childItems.length; i++) {
               ungroupedItems.push({ ...item, childNum: i + 1 })
            }
         }
      } 
      else { ungroupedItems.push(item) }

      return ungroupedItems
   }

   function ungroupAndExtractItems(items) { 
      // console.log("ungroupAndExtractItems", items)
      const extractedItems = []
      for (const item of ungroupItems(items)) {
         extractedItems.push(extractFromItemGroup(item))
      }
      return extractedItems
   }
   
   // an extracted item has a unique coumpound id and linkId
   // it functions like a single item, with a primaryImage
   function extractFromItemGroup(item) { 
      // console.log("extractFromItemGroup", item)
      if (!isItemGroup(item)) { return item }
      const childNum = item.childNum ? item.childNum : 1
      if (childNum > item.childItems.length) { 
         console.log("extractFromItemGroup error - childNum (" + childNum + ") exceeds childItems length", item)
         return {} 
      }
      
      const extractedItem = { ...item.childItems[childNum - 1] }
      extractedItem.id          = "ex-" + item.id + "-" + extractedItem.id
      extractedItem.linkId      = item.id
      extractedItem.userId      = item.userId
      extractedItem.childNum    = item.childNum
      extractedItem.state       = item.state
      extractedItem.yearCreated = item.yearCreated
      extractedItem.groupIds    = item.groupIds
      extractedItem.galleryIds  = item.galleryIds
      extractedItem.onUserWall  = item.onUserWall
      extractedItem.dateContentModified = item.dateContentModified
      if (item.isFeedItem) {
         extractedItem.isFeedItem = item.isFeedItem
         extractedItem.parentFeed = item.parentFeed
         extractedItem.groups     = item.groups
         extractedItem.username   = item.username
      }
      
      return extractedItem
   }

   function itemNavURL(itemId, origin, navAction, childNum) { 
      return URL.ITEM + origin + '/' + navAction + '/' + itemId + (childNum ? '/' + childNum : '') }
   function itemURL(itemId, origin, childNum) { return itemNavURL(itemId, origin, ItemNavAction.EXTERNAL, childNum) }
   
   function getPopupImage(imageName, artistName, url, boundingRect, aspectRatio) { 
      const offset = 25
      const name = imageName + (artistName ? " - " + artistName : "")
      const popupWidth = aspectRatio < 1 ? 300 : 500 
      const popupHeight = Math.round(popupWidth / aspectRatio) + (name.length ? 25 : 0)  
      const x = boundingRect.left < windowWidth.value / 2 ? 
         boundingRect.right + offset : 
         boundingRect.left - popupWidth - offset 
      const y = boundingRect.top + popupHeight < windowHeight.value ? 
         boundingRect.top - offset : 
         boundingRect.bottom - popupHeight + offset

      return { 
         name: name, 
         url: url, 
         x: x, 
         y: y, 
         width:  popupWidth, 
         height: popupHeight }
   }

   return { 
      myItemIdToItem, artistIdToMyItemIds, 
      recentPublicItems, recentGroupMemberItems, myRecentItems, getRecentItems, getRecentPublicItems,
      isItemGroup, ungroupItems, ungroupItem, ungroupAndExtractItems, extractFromItemGroup,
      itemAspectRatio, itemNavURL, itemURL, getPopupImage, createItemImage }
})
