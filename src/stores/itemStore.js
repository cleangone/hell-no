import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { db } from '@/firebase'
import { collection, doc, query, where, setDoc, updateDoc, deleteDoc, arrayRemove, arrayUnion, serverTimestamp } from "firebase/firestore"
import { useFirestore } from '@vueuse/firebase/useFirestore'   
import { useUserStore }  from './userStore'
import { useGroupStore } from '@/stores/groupStore'
import { randomPlate } from '@/utils/utils'
import { ItemType, State } from '@/utils/constants'
    
/*
   Item
      id
      name
      alternateName
      userId
      profileId
      type: ItemType: SINGLE, GROUP
      state: State: PUBLIC, GROUP, PRIVATE, HIDDEN 
      yearCreated: optional user visible text field
      childNum - transient, populated in ungrouped items, 1-n (for zero-based truthieness)
      extractedFromId - transient, populated in extracted items
      groupIds[]
      galleryIds[]
      subTitle
      desc
      primaryImage 
         id
         imageType: Primary, Crop, Gallery, Header
         dimensions
            width
            height
         filePath
         thumbFilePath (cut down to fit in a 300x300 box)
         largeThumbFilePath (600x600)
         url
         thumbUrl
         largeThumbUrl
      otherImages[]
         ...primaryImage
         name
         showWithItem: boolean - image is shown as one of item's images
      primaryArtist
         id
         name
         fullName
      parentItemIds[] - itemGroups this item is part of
      childItems[] - items this itemGroup holds
      contributingGalleryOwnerIds[] - for access rules to allow gallery owner to update item      
      onUserWall
      versionTag: 6 digit alphanumeric tag that changs with every update - for cache control
      dateCreated
      dateModified
      dateContentModified
*/

const TABLE = 'items'

export const useItemStore = defineStore('item', () => {
   const userStore  = useUserStore()
   const groupStore = useGroupStore()   
   
   const itemCollection = collection(db, TABLE)
   function itemDoc(id) { return doc(db, TABLE, id) }

   const items = useFirestore(itemCollection)   
   const itemIdToItem = computed(() => { return items?.value ? new Map(items.value.map((obj) => [obj.id, obj])) : new Map() })
   const childItemIds = computed(() => { 
      const ids = new Set()
      if (items?.value) {
         for (const item of items.value) {
            if (item.type == ItemType.GROUP) {
               for (const childItem of item.childItems) { ids.add(childItem.id) }
            }
         }
      }
      return ids
   })
   
   const myItemsQuery = computed(() => userStore.userId && query(itemCollection, where('userId', '==', userStore.userId)))
   const myItems = useFirestore(myItemsQuery, null)
   const myItemIdToItem = computed(() => { return myItems && myItems.value ? new Map(myItems.value.map((obj) => [obj.id, obj])) : new Map() })
   const publicItemsQuery = computed(() => query(itemCollection, where('state', '==', State.PUBLIC)))
   const publicItems = useFirestore(publicItemsQuery, [])
   
   const myChildItemIds = computed(() => { 
      const childItemIds = new Set()
      for (const item of myItems.value) {
         if (item.type == ItemType.GROUP) {
            for (const childItem of item.childItems) { childItemIds.add(childItem.id) }
         }
      }
      return childItemIds
   })

   function getGalleryItems(galleryId) {
      // obviously inefficient
      const galleryItems = []
      if (items?.value) {  
         for (const item of items.value) {
            if (item.galleryIds.includes(galleryId)) { galleryItems.push(item) }
         }
      }
      return galleryItems
   }

   function getArtistItems(artistId) {
      const artistItems = artistIdToItems.value.get(artistId)
      return artistItems ? artistItems : []
   }

   function getArtistPublicItems(artistIds) {
      const artistsItems = []
      for (const artistId of artistIds) {
         const artistItems = artistIdToPublicItems.value ? artistIdToPublicItems.value.get(artistId) : []
         if (artistItems) { artistsItems.push(...artistItems) }
      }
      return artistsItems
   }

   const artistIdToItems       = computed(() => getArtistIdToItems(items.value))
   const artistIdToPublicItems = computed(() => getArtistIdToItems(publicItems.value))
   function getArtistIdToItems(itemArray) {
      const map = new Map()
      if (!itemArray) { return map }
      for (const item of itemArray) {
         if (item.primaryArtist?.id) { 
            let artistItems = map.get(item.primaryArtist.id)
            if (!artistItems) {
               artistItems = []
               map.set(item.primaryArtist.id, artistItems)
            }
            artistItems.push(item) 
         }
      }
      return map
   }

   const userIdToItems       = computed(() => getUserIdMap(items.value))
   const userIdToPublicItems = computed(() => getUserIdMap(publicItems.value))
   function getUserIdMap(objects) {
      const map = new Map()
      if (objects) {  
         for (const obj of objects) {
            if (!map.has(obj.userId)) { map.set(obj.userId, []) }
            map.get(obj.userId).push(obj)
         }
      }
      return map
   }

   const myGroupMemberItemsQuery = computed(() => 
      groupStore.myGroupIds?.length && 
      query(itemCollection, where('state', '==', State.GROUP), where('groupIds', 'array-contains-any', groupStore.myGroupIds)))
   const myGroupMemberItems = useFirestore(myGroupMemberItemsQuery, [])

   function getUserItems(userId)      { return getObjsFromMap(userId, userIdToItems.value) }
   function getUserPubicItems(userId) { return getObjsFromMap(userId, userIdToPublicItems.value) }
   function getObjsFromMap(id, map) { return map && map.has(id) ? map.get(id) : [] }

   function getItem(itemId) { return itemIdToItem.value ? itemIdToItem.value.get(itemId) : {} }

   function setItem(item) { 
      const itemToSet = { ...item, versionTag: randomPlate(), 
         dateCreated:serverTimestamp(), dateModified:serverTimestamp(), dateContentModified:serverTimestamp() }
      if (!itemToSet.groupIds)    { itemToSet.groupIds = [] }
      if (!itemToSet.galleryIds)  { itemToSet.galleryIds = [] }
      if (!itemToSet.otherImages) { itemToSet.otherImages = [] }

      setDoc(itemDoc(itemToSet.id), itemToSet) 
      return itemToSet
   }

   function updateItem(item)                   { return updateItemDoc(item.id, item) }
   function addOtherImage(itemId, image)       { updateItemDoc(itemId, { otherImages: arrayUnion(image) }) }
   function addCroppedImage(itemId, image)     { updateItemDoc(itemId, { otherImages: arrayUnion(image) },  false) }
   function removeOtherImage(itemId, image)    { updateItemDoc(itemId, { otherImages: arrayRemove(image) }, false) }
   function removeGalleryId(itemId, galleryId) { updateItemDoc(itemId, { galleryIds: arrayRemove(galleryId) }) }

   function deleteItem(id) {
      console.log("deleteItem", id) 
      if (myChildItemIds.value.has(id)) { console.log("Cannot delete child item " + id) }
      else { deleteDoc(doc(itemCollection, id)) }
   }

   function updateItemDoc(itemId, item, updateContentModified = true) {
      const itemToUpdate = { ...item, versionTag: randomPlate(), dateModified: serverTimestamp() }
      if (updateContentModified && (item.primaryImage || item.otherImages || item.primaryArtist || item.childItems)) { 
         itemToUpdate.dateContentModified = serverTimestamp() }
      updateDoc(itemDoc(itemId), itemToUpdate)
      return itemToUpdate
   }

   return { items, publicItems, childItemIds, itemIdToItem, 
            myItems, myItemIdToItem, myChildItemIds, myGroupMemberItems,
            getGalleryItems, getArtistItems, getArtistPublicItems, getItem, getUserItems, getUserPubicItems,
            setItem, updateItem, addOtherImage, addCroppedImage, removeOtherImage, removeGalleryId, deleteItem }
})
