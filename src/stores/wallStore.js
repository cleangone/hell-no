import { computed } from 'vue'
import { defineStore } from 'pinia'
import { db } from '@/firebase'
import { collection, doc, query, setDoc, updateDoc, serverTimestamp, arrayUnion, arrayRemove, where } from "firebase/firestore"
import { useFirestore } from '@vueuse/firebase/useFirestore'
import { useUserStore }  from './userStore'
import { objAspectRatio } from '@/utils/utils'
import { Defaults, DefaultWall, WallDisplayOrder, WallType } from '@/utils/constants'   

/*
   Wall
      id - user/groupId or 0 for home wall
      wallRows
      type: WallType: SITE, USER
      displayOrder: WallDisplayOrder: USER_SET, RANDOM
      addRecent: boolean
      wallItems[]
         itemId
         childNum: transient - used for ungrouped items         
         title - initially item.name, used for thumb text
         name  - initially item.name, used for popup text
         artist
            id
            fullName

         // todo - should be kept in wallItem, but then item/profile updates need to propagate
         profile - TODO
            id
            username
         imageId
         thumbUrl
         thumbDimensions - for display of thumb
         largeThumbUrl
         url - used to set url in nav
         dimensions
            width
            height
         width

      dateCreated
      dateModified
*/
const TABLE = 'walls'
   
export const useWallStore = defineStore('wall', () => {
   const userStore  = useUserStore()
   const wallCollection = collection(db, TABLE)
   function wallDoc(id) { return doc(db, TABLE, id) }
   
   // walls initial read caused issues with restrictive read rules
   //    allow read: if id == "0" || request.auth.uid == id || resource.data.type == "User" ||
   //        	exists(/databases/$(database)/documents/admins/$(request.auth.uid)); 
   // Rule relaxed for anyone to read because group walls not implemented.  Issue prob occurs when 
   // initial read happens before userId populated during auth startup, but will also occur when 
   // group walls included in data set
   const walls        = useFirestore(wallCollection)   
   const siteWall     = useFirestore(wallDoc(Defaults.SITE_ID), DefaultWall)

   const myWallQuery  = computed(() => userStore.userId && wallDoc(userStore.userId))
   const myWall       = useFirestore(myWallQuery, DefaultWall)
   const visibleWalls = computed(() => [ siteWall.value, myWall.value ])
   
   const userWallsQuery = computed(() => query(wallCollection, where('type', '==', WallType.USER)))
   const userWalls = useFirestore(userWallsQuery, [])
   const userWallItems = computed(() => { 
      const wallItems = []
      for (const userWall of userWalls.value) { wallItems.push(...userWall.wallItems) }
      return wallItems
   })

   const userIdToWall = computed(() => { return userWalls.value ? new Map(userWalls.value.map((obj) => [obj.id, obj])) : new Map() })
   function getUserWall(userId) { return userIdToWall.value.has(userId) ? userIdToWall.value.get(userId) : DefaultWall } 

   function getWall(id) {
      if (id == myWall.value.id)        { return myWall.value }
      else if (id == siteWall.value.id) { return siteWall.value }
      else return DefaultWall
   }

   function addWall(id, type) {
      setDoc(wallDoc(id), {
         id: id,
         type: type,
         displayOrder: WallDisplayOrder.RANDOM,
         wallRows: 2,
         wallItems: [],
         dateCreated: serverTimestamp(),
         dateModified: serverTimestamp()
      })
   }

   function updateWall(wall) {
      const wallToUpdate = { ...wall, dateModified: serverTimestamp() }
      updateDoc(wallDoc(wallToUpdate.id), wallToUpdate)
   }

   const myWallItemIds  = computed(() => myWall.value.wallItems.map(a => a.itemId) )
   const myWallImageIds = computed(() => myWall.value.wallItems.map(a => a.thumbImageId) )
   function myWallIncludesItem(itemId)   { return myWallItemIds.value.includes(itemId) }   
   function myWallIncludesImage(imageId) { return myWallImageIds.value.includes(imageId) }   
   
   // const siteWallItemIds  = computed(() => siteWall.value.wallItems.map(a => a.itemId) )
   // const siteWallImageIds = computed(() => siteWall.value.wallItems.map(a => a.imageId) )
   // function siteWallIncludesItem(itemId)   { return siteWallItemIds.value.includes(itemId) }   
   // function siteWallIncludesImage(imageId) { return siteWallImageIds.value.includes(imageId) }   
   
   // wallItem thumb might not be the primaryImage
   function addMyWallItem(item, image) {
      const newWallItem = createWallItem(item, image)
      updateWallDoc(userStore.userId, { wallItems: arrayUnion(newWallItem) }) 
   }

   function addWallItem(userId, item, image) {
      const newWallItem = createWallItem(item, image)
      updateWallDoc(userId, { wallItems: arrayUnion(newWallItem) }) 
   }

   function createWallItem(item, image) {
      const aspectRatio = objAspectRatio(image.dimensions)
      return { 
         // wall shows the itemGroup child thumb but links to the parent
         itemId:    item.id, 
         childNum:  item.childNum ? item.childNum : null, 
         title:     item.name, 
         name:      item.name, 
         artist:    item.primaryArtist ? { id: item.primaryArtist.id, fullName: item.primaryArtist.fullName } : null,
         // profileId: item.profileId ? item.profileId : null,
         thumbImageId:    image.id, 
         thumbUrl:        image.thumbUrl, 
         thumbDimensions: { ...image.dimensions }, 
         thumbWidth: aspectRatio < 1 ? 150 : Math.min(Math.floor(150 * aspectRatio), 300), 
      
         popupUrl: item.primaryImage.largeThumbUrl, 
         // url:      image.url, 
         popupDimensions: { ...item.primaryImage.dimensions }, 
      }
   }

   // function addSiteWallItem(wallItem) {
   //    const newWallItem = { ...wallItem }
   //    newWallItem.dimensions = { ...wallItem.dimensions }   
   //    if (wallItem.artist) { newWallItem.artist = { ...wallItem.artist } }
   //    if (wallItem.thumbDimensions) { newWallItem.thumbDimensions = { ...wallItem.thumbDimensions } }
        
   //    updateWallDoc(Defaults.SITE_ID, { wallItems: arrayUnion(newWallItem) }) 
   // }

   function removeWallsItemId(itemId) {
      // for (const wall of visibleWalls.value) { 
      for (const wall of walls.value) { 
         const wallItemsToRemove = [] 
         for (const wallItem of wall.wallItems) { 
            if (wallItem.itemId == itemId) { wallItemsToRemove.push(wallItem) }
         }   
         removeWallItems(wallItemsToRemove, wall.id)
      }
   }

   function removeWallsImageId(imageId) { 
      for (const wall of visibleWalls.value) { 
         const wallItemsToRemove = [] 
         for (const wallItem of wall.wallItems) { 
            if (wallItem.imageId == imageId) { wallItemsToRemove.push(wallItem) }
         }   
         removeWallItems(wallItemsToRemove, wall.id)
      }
   }

   function removeWallItem(wallItemToRemove, wallId) { updateWallDoc(wallId, { wallItems: arrayRemove(wallItemToRemove) }) }
   function removeWallItems(wallItemsToRemove, wallId) {
      if (wallItemsToRemove.length) { updateWallDoc(wallId, { wallItems: arrayRemove(...wallItemsToRemove) }) }
   }

   function updateWallDoc(id, wall) { updateDoc(wallDoc(id), { ...wall, dateModified: serverTimestamp() }) }

   return { 
      walls, siteWall, userWallItems, myWall, myWallIncludesItem, myWallIncludesImage, addMyWallItem, addWallItem,
      getWall, getUserWall, createWallItem, addWall, updateWall, removeWallsItemId, removeWallsImageId, removeWallItem
      // siteWallIncludesItem, siteWallIncludesImage, addSiteWallItem
   }
})
