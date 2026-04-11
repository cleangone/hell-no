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
   import { useUserStore } from '@/stores/userStore'
   import { useViewStore } from '@/stores/viewStore'
   import { useViewMgr }   from '@/stores/viewMgr'
   import IconButton       from '@/components/util/IconButton.vue'
   import { GalleryThumbOptions as ThumbOptions } from '@/utils/constants'

   const userStore = useUserStore()
   const viewStore = useViewStore()
   const viewMgr   = useViewMgr()
   
   const allOptions = computed(() => {
      const options = viewMgr.isXs ? [ ThumbOptions.SM_THUMB, ThumbOptions.SHOW_CHILD ] : [ ThumbOptions.SHOW_CHILD ]
      if (userStore.userExists) { options.push(ThumbOptions.SHOW_PRIVATE) }
      options.push(...[ ThumbOptions.UPDATED, ThumbOptions.SORT_BY_NAME, ThumbOptions.SORT_BY_DATE ])
   
      return options
   })
   
   const selectedOptions = computed({ 
      get() { return viewStore.galleryThumbOptions },
      set(checkboxOptions) { 
         const origSortOption = 
            selectedOptions.value.includes(ThumbOptions.SORT_BY_NAME) ? ThumbOptions.SORT_BY_NAME : ThumbOptions.SORT_BY_DATE 
         let updatedSortOption = null
          
         const options = []
         for (const checkboxOption of checkboxOptions) {
            if (checkboxOption == ThumbOptions.SORT_BY_NAME || checkboxOption == ThumbOptions.SORT_BY_DATE) {
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
