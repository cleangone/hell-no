import { defineStore } from 'pinia'
import { useProfileStore }  from '@/stores/profileStore'

export const useProfileImageHandler = defineStore('profileImageHandler', () => {   
   const profileStore = useProfileStore()
   
   function addImageSet   (imageSet, context) { profileStore.addImage(context.profileId, imageSet) }
   function updateImageSet(imageSet, context) { profileStore.updateImage(context.profileId, imageSet) }

   return { addImageSet, updateImageSet }
})
