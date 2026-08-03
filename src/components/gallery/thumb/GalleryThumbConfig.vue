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
   import { useUserStore } from '@/stores/userStore'
   import { useViewStore } from '@/stores/viewStore'
   import { useViewMgr }   from '@/stores/viewMgr'
   import IconButton       from '@/components/util/IconButton.vue'
   import { GalleryThumbOptions as ThumbOptions } from '@/utils/constants'

   const userStore = useUserStore()
   const viewStore = useViewStore()
   const viewMgr   = useViewMgr()
   
   const options = computed(() => {
      const opts = [ ThumbOptions.SHOW_CHILD ]
      if (userStore.userExists) { opts.push(ThumbOptions.SHOW_PRIVATE) }
      if (!viewMgr.solo) { opts.push(ThumbOptions.USER) }
      opts.push(ThumbOptions.UPDATED)
      return opts
   })
   
   const selectedOptions = computed({ 
      get() { return viewStore.galleryThumbOptions },
      set(options) { viewStore.setGalleryThumbOptions(options) } 
   })
</script>

<style>
</style>
