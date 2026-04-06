<template>
   <!-- <h1>Items</h1> 
   <div v-for="item in items">
      {{ item.name }}
   </div> -->

   <h1>Galleries</h1> 
   <div>
      <GalleryThumb v-for="gallery in visibleGalleries" :key="gallery.id" :gallery="gallery"/>    
   </div>

</template>

<script setup>
   import { computed, ref } from 'vue'
   import { useItemStore }    from '@/stores/itemStore'
   import { useGalleryStore } from '@/stores/galleryStore'
   import GalleryThumb    from '@/components/gallery/GalleryThumb.vue'
   import { timestampsEqual } from '@/utils/dateUtils'
   
   const itemStore    = useItemStore()
   const galleryStore = useGalleryStore()
 
   const items = computed(() => { 
      return itemStore.items 
   })
   
   const visibleGalleries = computed(() => { 
      const galleries = []     
      const allGalleries = galleryStore.publicGalleries
      for (const gallery of allGalleries) {
         if (gallery.images.length && showGallery(gallery) ) { galleries.push(gallery) }
         // if (gallery.images.length  ) { galleries.push(gallery) }
      }    
      galleries.sort(function(a, b) { return b.dateContentModified - a.dateContentModified }) 
      return galleries
   })
   const showGallery = (gallery)  => {
      if (!gallery.childGalleryIds.length) { return true } // not a parent
      for (const childGallery of galleryStore.publicGalleryIdToChildGalleries.get(gallery.id)) {
         if (timestampsEqual(gallery.dateContentModified, childGallery.dateContentModified)) {
            return false // parent has same dateContentModified as a child
         }
      } 
      return true // gallery a parent with dateContentModified different than all children
   }

   const galleries = computed(() => { 
      return galleryStore.galleries 
   })
</script>

<style>
</style>