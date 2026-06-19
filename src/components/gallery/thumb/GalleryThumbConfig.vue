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
   import IconButton       from '@/components/util/IconButton.vue'
   import { GalleryThumbOptions as ThumbOptions } from '@/utils/constants'

   const userStore = useUserStore()
   const viewStore = useViewStore()
   
   const allOptions = computed(() => {
      const options = [ ThumbOptions.SHOW_CHILD ]
      if (userStore.userExists) { options.push(ThumbOptions.SHOW_PRIVATE) }
      options.push(...[ ThumbOptions.USER, ThumbOptions.UPDATED ])
      return options
   })
   
   const selectedOptions = computed({ 
      get() { return viewStore.galleryThumbOptions },
      set(options) { viewStore.setGalleryThumbOptions(options) } 
   })
</script>

<style>
</style>
