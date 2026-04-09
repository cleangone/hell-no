<template>
   <v-menu :close-on-content-click="false">
      <template v-slot:activator="{ props }">
         <IconButton v-bind="props" icon="mdi-image-edit" size="medium"/>
      </template>

      <v-list v-model:selected="selectedOptions" select-strategy="leaf">
         <v-list-item-title class="ma-2 font-weight-bold">Gallery Thumbnails</v-list-item-title>     
         <v-list-item v-for="option in options" :key="option.id" :title="option.name" :value="option.id">
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
   import { GalleryOptions } from '@/utils/constants'

   // const props = defineProps({ origin: String, additionalFields: Array })
   const viewStore = useViewStore()
   const options = [
      { id: GalleryOptions.SHOW_CHILD,   name: "Show Child Galleries" },
      { id: GalleryOptions.SHOW_PRIVATE, name: "Show My Private Galleries" }, 
      { id: GalleryOptions.SORT_BY_NAME, name: "Sort by Name" }, 
      { id: GalleryOptions.SORT_BY_DATE, name: "Sort by Date" } ]
         
   const selectedOptions = computed({ 
      get() { return viewStore.galleryThumbOptions },
      set(checkboxOptions) { 
         const origSortOption = selectedOptions.value.includes(GalleryOptions.SORT_BY_NAME) ? GalleryOptions.SORT_BY_NAME : GalleryOptions.SORT_BY_DATE 
         let updatedSortOption = null
          
         const options = []
         for (const checkboxOption of checkboxOptions) {
            if (checkboxOption == GalleryOptions.SORT_BY_NAME || checkboxOption == GalleryOptions.SORT_BY_DATE) {
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
