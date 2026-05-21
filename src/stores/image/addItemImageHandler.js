import { defineStore } from 'pinia'
import { useItemStore } from '@/stores/itemStore'
   
export const useAddItemImageHandler = defineStore('addItemImageHandler', () => {   
   const itemStore = useItemStore()
   
   // add not implemented yet
   function addImageSet(imageSet, context) { throw new Error("addItemImageHandler.addImageSet not implemented") }
   function updateImageSet(imageSet, context) { itemStore.updatePrimaryImage(context.itemId, imageSet) }

   return { addImageSet, updateImageSet }
})
