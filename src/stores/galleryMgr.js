import { computed } from 'vue'
import { defineStore } from 'pinia'
import { useGalleryStore } from './galleryStore'
import { useItemStore }    from './itemStore'
import { ImageType } from '@/utils/constants'
   
export const useGalleryMgr = defineStore('galleryMgr', () => {   
   const galleryStore = useGalleryStore()
   const itemStore    = useItemStore()

   function getUserGalleries(userId) {
      const userGalleries = []
      if (galleryStore.galleries) {  
         for (const gallery of galleryStore.galleries) {
            if (gallery.userId == userId) { userGalleries.push(gallery) }
         }
      }
      return userGalleries
   }

   function deleteGallery(gallery) {
      if (gallery.parentGalleryId) { galleryStore.removeChildGalleryId(gallery.parentGalleryId, gallery.id) }
   
      if (gallery.childGalleryIds) {
         for (const childGalleryId of gallery.childGalleryIds) {
            galleryStore.updateGallery({ id: childGalleryId, parentGalleryId: null }) 
         }
      }

      for (const itemId of gallery.itemIds) {
         itemStore.removeGalleryId(itemId, gallery.id) 
      }
  
      galleryStore.deleteGallery(gallery.id)
   }

   function uniqueItems(gallery) {     
      const itemIdToItem = new Map()
      for (const itemId of gallery.itemIds) {
         const item = itemStore.getItem(itemId)
         if (item) { itemIdToItem.set(item.id, item) }
      }

      for (const childGalleryId of gallery.childGalleryIds) {
         const childGallery = galleryStore.getGallery(childGalleryId)
         for (const item of uniqueItems(childGallery)) {
            itemIdToItem.set(item.id, item)
         }
      }
      return Array.from(itemIdToItem.values())
   }

   const galleryImage = (item, image, active) => {
      return {
         id:         image.id,
         imageType:  image.imageType,
         url:        image.url,
         thumbUrl:   image.thumbUrl,
         dimensions: image.dimensions,
         itemId:                item.id, 
         name:                  item.name, 
         originalDimensions:    item.primaryImage.dimensions,
         originalLargeThumbUrl: item.primaryImage.largeThumbUrl,
         active: active, 
      }
   }

   function hasGalleryThumbImage(gallery) {
      for (const image of gallery.images) {
         if (image.imageType == ImageType.GALLERY) { return true }
      }
      return false
   }

   const myGalleryOptions = computed(() => { 
      const options = []
       for (const gallery of galleryStore.myGalleries) { 
         options.push({ title: gallery.name, value: gallery.id })
       }
       return options
    })

    function getGalleryOptions(userId) { 
      const options = []
      if (galleryStore.userIdToGalleries.has(userId)) {
         for (const gallery of galleryStore.userIdToGalleries.get(userId)) {
            options.push({ title: gallery.name, value: gallery.id })
         }
       }
       return options
    }

    // todo - possibly move dateContentModified logic to backend
    function removeItemId(galleryId, itemToDeleteId) {   
      const otherItems = []
      const gallery = galleryStore.getGallery(galleryId)
      for (const itemId of gallery.itemIds) {
         const item = itemStore.getItem(itemId)
         if ( item.id != itemToDeleteId && item.dateContentModified) { otherItems.push(item) }
      }

      otherItems.sort(function(a, b){return b.dateContentModified - a.dateContentModified}) 
      const dateContentModified = otherItems.length ? otherItems[0].dateContentModified : null

      galleryStore.removeItemId(galleryId, itemToDeleteId, dateContentModified) 
   }

   const profileIdToGalleryIds = computed(() => { 
      const profileIdToGalIds = new Map() 
      if (galleryStore.galleries) {
         for (const gallery of galleryStore.galleries) { 
            if (gallery.profileId) {
               const galleryIds = profileIdToGalIds.get(gallery.profileId)
               if (galleryIds) { galleryIds.push(gallery.id) }
               else { profileIdToGalIds.set(gallery.profileId, [ gallery.id ]) } 
            }
         }
      }
      return profileIdToGalIds
   })

   function getProfileCount(profileId) { 
      if (profileIdToGalleryIds.value) {
         const galleryIds = profileIdToGalleryIds.value.get(profileId)
         if (galleryIds) { return galleryIds.length }
      }
      return 0
   }

   function getCheckboxes(selectedGalleryIds) { 
      const checkboxContainer = { checkboxes: [], selectedGalleries: [] }
      
      for (const gallery of [...galleryStore.myGalleries] ) {
         const isSelected = selectedGalleryIds.includes(gallery.id)
         if (isSelected) { checkboxContainer.selectedGalleries.push(gallery) }
         checkboxContainer.checkboxes.push({ 
            id: gallery.id, 
            name: gallery.name, 
            sort: gallery.sortName?.length ? gallery.sortName : gallery.name,
            isSelected: isSelected,
            isParent: gallery.childGalleryIds?.length > 0, 
            parentId: gallery.parentGalleryId, 
         })
      }
      checkboxContainer.checkboxes.sort(function(a, b){return a.sort.localeCompare(b.sort)}) 
      
      // contributing galleries at the end
      for (const gallery of galleryStore.myContributingGalleries ) {
         const isSelected = selectedGalleryIds.includes(gallery.id)
         if (isSelected) { checkboxContainer.selectedGalleries.push(gallery) }
         checkboxContainer.checkboxes.push({ 
            id: gallery.id, 
            name: gallery.name + "(Contributor)", 
            isSelected: isSelected,
         })
      }

      return checkboxContainer
   }

   return { getUserGalleries, deleteGallery, uniqueItems, galleryImage, hasGalleryThumbImage, 
      myGalleryOptions, getGalleryOptions, removeItemId, getProfileCount, getCheckboxes 
   } 
})

