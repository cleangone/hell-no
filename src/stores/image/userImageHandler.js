import { defineStore } from 'pinia'
import { useUserStore } from '@/stores/userStore'

export const useUserImageHandler = defineStore('userImageHandler', () => {   
   const userStore = useUserStore()
   
   function addImageSet   (imageSet, context) { userStore.addImage(imageSet) }
   function updateImageSet(imageSet, context) { userStore.updateImage(imageSet) }

   return { addImageSet, updateImageSet }
})
