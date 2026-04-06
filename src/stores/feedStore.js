import { computed } from 'vue'
import { defineStore } from 'pinia'
import { db } from '@/firebase'
import { collection, doc, query, where, setDoc, updateDoc, deleteDoc, arrayUnion, arrayRemove, serverTimestamp } from "firebase/firestore"
import { useFirestore } from '@vueuse/firebase/useFirestore'
import { useUserStore }  from './userStore'
import { useGroupStore } from './groupStore'
import { ParentFeedType } from '@/utils/constants'
   
const TABLE = 'feeds'

/*
   feed:
      id: userId or groupId
      type: FeedType: USER, GROUP
      feedItems []
         (following fields are the same as item because feedItem displayed by ItemThumb)
            id
            name
            userId
            type: ItemType: SINGLE, GROUP
            state: State: PUBLIC, GROUP
            groupIds - filled in initially, replaced by groups
            primaryArtist
            childItems: if type == GROUP
            primaryImage: if type != GROUP
            dateModified
         (following fields are specific to feedItem)
            isFeedItem: true - prevents in-place edit on ItemView
            feedItemId: for uniqueness in feedItems array add/remove
            username: user cannot look up another user's info
            groups []
               id
               name
            parentFeedType: ParentFeedType.SAVED when set, null otherwise
      dateCreated
      dateModified
*/
export const useFeedStore = defineStore('feed', () => {
   const feedCollection = collection(db, TABLE)
   const feeds = useFirestore(feedCollection)   
   const feedIdToGroup = computed(() => { return feeds.value ? new Map(feeds.value.map((obj) => [obj.id, obj])) : new Map() })
   
   const userStore  = useUserStore()
   const groupStore = useGroupStore()
   const myFeedQuery = computed(() => userStore.userId && feedDoc(userStore.userId))
   const myFeed = useFirestore(myFeedQuery, { feedItems:[] })

   const myGroupFeedQuery = computed(() => groupStore.myGroupIds?.length && query(feedCollection, where('id', "in", groupStore.myGroupIds)))
   const myGroupFeeds = useFirestore(myGroupFeedQuery, [])
   const groupIdToMyGroupFeed = computed(() => { return myGroupFeeds.value ? new Map(myGroupFeeds.value.map((obj) => [obj.id, obj])) : new Map() })
   
   function feedDoc(id) { return doc(db, TABLE, id) }
   
   function getFeed(id) { return feedIdToGroup.value.get(id) }
   function getMyGroupFeed(id) {return groupIdToMyGroupFeed.value.get(id) }

   function addFeed(id, type) {
      const feed = { id:id, type:type, feedItems:[], savedItems:[], dismissedItems:[], dateCreated: serverTimestamp(), dateModified: serverTimestamp() }
      setDoc(feedDoc(id), feed)
      return feed
   }

   function deleteFeed(id) {
      console.log("deleteFeed", id) 
      deleteDoc(doc(feedCollection, id))
   }
   
   function deleteFeedItem(feedId, feedItem) {
      // admin action - do not update dateModified
      updateDoc(feedDoc(feedId), { feedItems: arrayRemove(feedItem) })
   }

   function saveMyFeedItem(feedItem) {
      // console.log("saveMyFeedItem", feedItem) 
      const savedFeedItem = { ...feedItem, parentFeedType: ParentFeedType.SAVED }
      updateDoc(feedDoc(userStore.userId), 
         { feedItems: arrayRemove(feedItem), savedItems: arrayUnion(savedFeedItem), dateModified: serverTimestamp() }
      )
   }
   
   function addMyFeedItemToSaved(feedItem) {
      // console.log("addMyFeedItemToSaved", feedItem) 
      const savedFeedItem = { ...feedItem, parentFeedType: ParentFeedType.SAVED }
      updateDoc(feedDoc(userStore.userId), { savedItems: arrayUnion(savedFeedItem), dateModified: serverTimestamp() })
   }

   function dismissMyFeedItem(feedItem) {
      // console.log("dismissMyFeedItem", feedItem) 
      const update = feedItem.parentFeedType == ParentFeedType.SAVED ? 
         { savedItems:arrayRemove(feedItem) } : { feedItems:arrayRemove(feedItem) }
      updateDoc(feedDoc(userStore.userId), { ...update, dateModified: serverTimestamp() })
   }

   return { feeds, getFeed, addFeed, deleteFeed, deleteFeedItem,  
            myFeed, getMyGroupFeed, myGroupFeeds, saveMyFeedItem, addMyFeedItemToSaved, dismissMyFeedItem }
})
