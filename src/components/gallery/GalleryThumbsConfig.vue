<template>
   <v-menu :close-on-content-click="false">
      <template v-slot:activator="{ props }">
         <IconButton v-bind="props" icon="mdi-image-edit" size="medium"/>
      </template>

      <v-list v-model:selected="selectedOptions" select-strategy="leaf">
         <v-list-item-title class="ma-2 font-weight-bold">Gallery Thumbnails</v-list-item-title>     
         <v-list-item v-for="option in options" :key="option" :title="option" :value="option">
            <template v-slot:prepend="{ isSelected }">
               <v-list-item-action start>
                  <v-checkbox-btn :model-value="isSelected"></v-checkbox-btn>
               </v-list-item-action>
            </template>
         </v-list-item>
      </v-list>
   </v-menu>
</template>

<script setup>
   import { computed } from 'vue'
   import { useViewStore } from '@/stores/viewStore'
   import IconButton from '@/components/util/IconButton.vue'
   import { ThumbOptionsGallery } from '@/utils/constants'

   const viewStore = useViewStore()
   const options = [ 
      ThumbOptionsGallery.SHOW_CHILD, ThumbOptionsGallery.SHOW_PRIVATE, ThumbOptionsGallery.SORT_BY_NAME, ThumbOptionsGallery.SORT_BY_DATE ]
         
   const selectedOptions = computed({ 
      get() { return viewStore.galleryThumbOptions },
      set(checkboxOptions) { 
         const origSortOption = 
            selectedOptions.value.includes(ThumbOptionsGallery.SORT_BY_NAME) ? ThumbOptionsGallery.SORT_BY_NAME : ThumbOptionsGallery.SORT_BY_DATE 
         let updatedSortOption = null
          
         const options = []
         for (const checkboxOption of checkboxOptions) {
            if (checkboxOption == ThumbOptionsGallery.SORT_BY_NAME || checkboxOption == ThumbOptionsGallery.SORT_BY_DATE) {
               if (checkboxOption != origSortOption) { updatedSortOption = checkboxOption } 
            }
            else { options.push(checkboxOption) }
         }

         options.push(updatedSortOption ? updatedSortOption : origSortOption) 
         viewStore.setGalleryThumbOptions(options) 
      } 
   })

</script>

<style>
</style>
