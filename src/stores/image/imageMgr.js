import { defineStore } from 'pinia'
import { storage } from '@/firebase'
import { getDownloadURL, ref as storageRef } from 'firebase/storage'
import { dateUuid } from '@/utils/utils'
import { ImageType } from '@/utils/constants'
   
export const useImageMgr = defineStore('imageMgr', () => {   
   const MAX_RETRIES  = 10
   const DELAY_MILLIS = 2000

   function createImageSet(imageType, subDir = null) {
      const id = dateUuid()
      // const dir = "  images/" + (subDir ? subDir + "/" : "")
      const dir = "images/" + (subDir ? subDir + "/" : "")
      const filePath = dir + id 

      return { 
         id: id, 
         imageType: imageType,
         filePath:           filePath,
         thumbFilePath:      filePath + "_300x300",
         largeThumbFilePath: filePath + "_600x600"
      }
   }

   function isUploadImage(imageSet) { return imageSet.imageType == ImageType.UPLOAD }
   function isUserImage(imageSet)   { return imageSet.imageType == ImageType.USER }
   function isActive(imageSet)      { return imageSet.active }
   function isActiveUserImage(imageSet) { return isUserImage(imageSet) && isActive(imageSet) }
   
   function waitForThumbUrls(imageSet, uploadHandler, uploadContext) {
      setTimeout(function() { retryThumbUrls(imageSet, uploadHandler, uploadContext) }, DELAY_MILLIS)
   }

   async function retryThumbUrls(imageSet, uploadHandler, uploadContext) {
      for (let i=0; i<MAX_RETRIES; i++) {
         try {
            await fetchThumbUrls(imageSet, uploadHandler, uploadContext)
            return
         } 
         catch (error) { 
            console.log("Thumb error", error) 
            await new Promise(resolve => setTimeout(resolve, DELAY_MILLIS))
         }
      }
      console.log("Could not find Thumb Download URLs") 
   }  

   async function fetchThumbUrls(imageSet, uploadHandler, uploadContext) {
      console.log("Checking image thumbs")
      const thumbImageRef = storageRef(storage, imageSet.thumbFilePath)
      imageSet.thumbUrl = await getDownloadURL(thumbImageRef)
      
      const largeThumbImageRef = storageRef(storage, imageSet.largeThumbFilePath)
      imageSet.largeThumbUrl = await getDownloadURL(largeThumbImageRef)
      
      console.log("Updating image thumbs")
      uploadHandler.updateImageSet(imageSet, uploadContext)
   } 

   return { createImageSet, isUploadImage, isUserImage, isActive, isActiveUserImage, waitForThumbUrls }
})
