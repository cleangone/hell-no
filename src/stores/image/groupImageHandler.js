import { defineStore } from 'pinia'
import { useGroupStore } from '@/stores/groupStore'

export const useGroupImageHandler = defineStore('groupImageHandler', () => {   
   const groupStore = useGroupStore()
   
   function addImageSet(imageSet, context)    { groupStore.addImage(context.groupId, imageSet) }
   function updateImageSet(imageSet, context) { groupStore.updateImage(context.groupId, imageSet) }

   return { addImageSet, updateImageSet }
})
