<template>
   <v-menu :close-on-content-click="false">
      <template v-slot:activator="{ props }">
         <IconButton v-bind="props" icon="mdi-image-edit" size="medium"/>
      </template>

      <v-list v-model:selected="selectedOptions" select-strategy="leaf">
         <v-list-item-title class="ma-2 font-weight-bold">Gallery Thumbnails</v-list-item-title>     
         <v-list-item v-for="option in allOptions" :key="option" :title="option" :value="option">
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
   import { breakpointsTailwind, useBreakpoints } from '@vueuse/core'
   import { useViewStore } from '@/stores/viewStore'
   import IconButton from '@/components/util/IconButton.vue'
   import { ThumbOptionsGallery } from '@/utils/constants'

   const breakpoints = useBreakpoints(breakpointsTailwind)
   const xs = breakpoints.smaller('sm')
   const viewStore = useViewStore()
   
   const defaultOptions = [ 
      ThumbOptionsGallery.SHOW_CHILD, ThumbOptionsGallery.SHOW_PRIVATE, ThumbOptionsGallery.SORT_BY_NAME, ThumbOptionsGallery.SORT_BY_DATE ]
   const allOptions = computed(() => {
       const options = xs.value ? [ ThumbOptionsGallery.SM_THUMB ] : []
       options.push(...defaultOptions)
       return options
   })
   
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
