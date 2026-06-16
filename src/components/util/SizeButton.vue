<template>
   <IconButton icon="mdi-image-size-select-large" @click="advanceThumbSize()" size="med"/> 
</template>

<script setup>
   import { computed, ref } from 'vue'
   import { useViewStore } from '@/stores/viewStore'
   import { useViewMgr }   from '@/stores/viewMgr'
   import IconButton       from './IconButton.vue'
   import { ThumbSize }    from '@/utils/constants'
   
   const viewStore = useViewStore()
   const viewMgr   = useViewMgr()
   
   const advanceThumbSize = () => { 
      const thumbSize = { ...viewStore.thumbSize }
      if (viewMgr.isXs) { thumbSize.xsSize = getNextSize(thumbSize.xsSize) } 
      else { thumbSize.size = getNextSize(thumbSize.size) }

      viewStore.setThumbSize(thumbSize) 
   }

   const getNextSize = (size) => { 
      if (size == ThumbSize.SM) { return ThumbSize.MED }
      else if (size == ThumbSize.MED) { return ThumbSize.LG }
      else { return ThumbSize.SM }
   }
</script>