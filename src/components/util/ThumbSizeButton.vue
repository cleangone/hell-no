<template>
   <IconButton icon="mdi-image-size-select-large" @click="advanceThumbSize()" size="med"/> 
</template>

<script setup>
   import { computed, ref } from 'vue'
   import { useViewStore } from '@/stores/viewStore'
   import { useViewMgr }   from '@/stores/viewMgr'
   import IconButton       from '@/components/util/IconButton.vue'
   import { ThumbSize, ThumbType } from '@/utils/constants'
   

   const props = defineProps({
      thumbType: { type: String, default: ThumbType.ITEM },
   })

   const viewStore = useViewStore()
   const viewMgr   = useViewMgr()
   
   const advanceThumbSize = () => { 
      const thumbSize = { ...viewStore.thumbSize }
      if (props.thumbType == ThumbType.ITEM && viewMgr.isXs) { thumbSize.xsSize = getNextSize(thumbSize.xsSize) } 
      else if (props.thumbType == ThumbType.ITEM) { thumbSize.size = getNextSize(thumbSize.size) }
      else if (viewMgr.isXs) { thumbSize.galleryXsSize = getNextSize(thumbSize.galleryXsSize) }
      else { thumbSize.gallerySize = getNextSize(thumbSize.gallerySize) }
      
      viewStore.setThumbSize(thumbSize) 
      console.log("thumbSize", props.thumbType, thumbSize)
   }

   const getNextSize = (size) => { 
      if (size == ThumbSize.IMG) { return ThumbSize.SM }
      else if (size == ThumbSize.SM) { return ThumbSize.MED }
      else if (size == ThumbSize.MED) { return ThumbSize.LG }
      else { return ThumbSize.IMG }
   }
</script>