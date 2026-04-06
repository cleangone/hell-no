import { computed } from 'vue'
import { defineStore } from 'pinia'
// import { serverTimestamp } from "firebase/firestore"
import { useUserStore } from './userStore'
import { useFeedStore } from './feedStore'
import { dateUuid } from '@/utils/utils'
import { ItemType } from '@/utils/constants'
   
export const useFeedMgr = defineStore('feedMgr', () => {   
   const userStore = useUserStore()
   const feedStore = useFeedStore()

   const myFeed = computed(() => { 
      const feed = { ...feedStore.myFeed }

      feed.feedItems = [ ...feed.feedItems ]
      feed.feedItems.sort(function(a, b){return b.dateModified - a.dateModified}) 

      if (feed.savedItems?.length) {
         feed.savedItems = [ ...feed.savedItems ]
         feed.savedItems.sort(function(a, b){return b.dateModified - a.dateModified}) 
      }
      
      return feed
   })
   
   function createFeedItem(updatedItem, existingItem) {
      const feedItem = {
         id: updatedItem.id,
         feedItemId: dateUuid(),
         name: updatedItem.name ? updatedItem.name : existingItem.name,
         userId: existingItem.userId,
         username: userStore.user.username,
         type: existingItem.type,
         state: updatedItem.state ? updatedItem.state : existingItem.state,
         isFeedItem: true, 
         groupIds: updatedItem.groupIds ? [ ...updatedItem.groupIds ] : [ ...existingItem.groupIds ],
         primaryArtist: updatedItem.primaryArtist ? updatedItem.primaryArtist : existingItem.primaryArtist,
         dateModified: updatedItem.dateModified
      }

      if (feedItem.type == ItemType.GROUP) { feedItem.childItems = existingItem.childItems }
      else { feedItem.primaryImage = existingItem.primaryImage }
      
      return feedItem
   }

   return { myFeed, createFeedItem } 
})

