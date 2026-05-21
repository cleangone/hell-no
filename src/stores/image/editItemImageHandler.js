import { defineStore } from 'pinia'
import { useItemStore } from '@/stores/itemStore'
   
export const useEditItemImageHandler = defineStore('editItemImageHandler', () => {   
   const itemStore = useItemStore()
   
   function addImageSet(imageSet, context)    { itemStore.addOtherImage(context.itemId, imageSet) }
   function updateImageSet(imageSet, context) { itemStore.updateOtherImage(context.itemId, imageSet) }

   return { addImageSet, updateImageSet }
})
