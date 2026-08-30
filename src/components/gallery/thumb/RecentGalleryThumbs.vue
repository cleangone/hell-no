<template>
   <div class="mb-5">
      <span class="font-weight-bold">Galleries</span> |
      <RouterLink :to="Route.GALLERIES.url + toRouteId">View all</RouterLink>
   </div>
   <v-row justify="space-around" class="">
      <GalleryThumb v-for="gallery in thumbGalleries" :key="gallery.id" :gallery="gallery" 
         :size="ThumbSize.MED" :bypassShowUser="bypassShowUser" showChildImages dense />
   </v-row>
</template>

<script setup>
   import { computed, ref } from 'vue'
   import { useViewMgr } from '@/stores/viewMgr'
   import GalleryThumb   from '@/components/gallery/thumb/GalleryThumb.vue'
   import { ThumbRow }   from '@/utils/utilClasses'
   import { Defaults, GalleryThumbMaxWidths as ThumbMaxWidths, Route, ThumbSize } from '@/utils/constants'
   
   const props = defineProps({ 
      galleries: Array, 
      toRouteId: { type: String, default: Defaults.SITE_ID }, 
      rowWidth:  { type: Number, default: 400}, 
      maxRows:   { type: Number, default: 1 },
      bypassShowUser: Boolean })
      // todo bypassShowUser for userView -> GalleryThumb - was there before refactor
   
   const viewMgr = useViewMgr()

   const thumbGalleries = computed(() => {   
      const thumbRow = new ThumbRow(props.maxRows, props.rowWidth)
      for (const gallery of props.galleries) {
         const thumbWidth = viewMgr.isXs ? 
            Math.floor(props.rowWidth * ThumbMaxWidths.xsSizes.get(ThumbSize.MED)) :  // xs is a pct
            ThumbMaxWidths.sizes.get(ThumbSize.MED)
         if (!thumbRow.addThumb(gallery, thumbWidth + 5)) { break }  
      } 
      return thumbRow.thumbs
   })
</script>

<style>
</style>
