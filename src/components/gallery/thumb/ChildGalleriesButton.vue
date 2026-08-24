<template>
   <IconButton :icon="showChildren?'mdi-folder-multiple-image':'mdi-folder-image'" 
         @click="toggle" size="med"/> 
</template>

<script setup>
   import { computed } from 'vue'
   import { useViewStore } from '@/stores/viewStore'
   import IconButton       from '@/components/util/IconButton.vue'
   import { removeArrayEntry } from '@/utils/utils'
   import { GalleryThumbOptions as ThumbOptions } from '@/utils/constants'

   const viewStore = useViewStore()
   
   const showChildren = computed(() => viewStore.galleryThumbOptions.includes(ThumbOptions.SHOW_CHILD))

   const toggle = () => {
      const options = [ ...viewStore.galleryThumbOptions ]
      if (showChildren.value) { removeArrayEntry(options, ThumbOptions.SHOW_CHILD) }
      else { options.push(ThumbOptions.SHOW_CHILD) }
      viewStore.setGalleryThumbOptions(options) 
   }
</script>

<style>
</style>
