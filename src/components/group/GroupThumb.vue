<template>
   <v-card :width="cardWidth" :class="cardMargin" class="group-card d-flex flex-column thumb-link" style="z-index: 1">
      <HorizontalDiv >
         <RouterLink v-if="image" :to="groupUrl" class="d-block flex-grow-1"> <!-- class keeps RouterLink from minimizing -->
            <v-img  :src="image.thumbUrl" class="hand"/>
         </RouterLink>
         <div class="mt-1 mx-3">
            <span class="font-weight-bold">{{ group.name }}</span>
            <UserDateText :date="group.dateModified" class="text-body-2"/>
         </div>
      </HorizontalDiv>
   </v-card>
</template>

<script setup>
   import { computed, ref } from 'vue'
   import { useWindowSize } from '@vueuse/core'
   import { useViewStore }  from '@/stores/viewStore'
   import { useViewMgr }    from '@/stores/viewMgr'
   import HorizontalDiv     from '@/components/util/HorizontalDiv.vue'
   import UserDateText      from '@/components/util/UserDateText.vue'
   import { Emit, GalleryThumbMaxWidths as MaxWidths, ImageType, Route, ThumbSize } from '@/utils/constants'
   
   const props = defineProps({ group: Object, size:String })
   const emit  = defineEmits([ Emit.CLOSE ])
   
   const { width: windowWidth } = useWindowSize()
   const viewStore    = useViewStore()
   const viewMgr      = useViewMgr()
   
   const cardMargin = computed(() => viewMgr.isXs ? "mb-2" : "mb-5")
   const groupUrl   = computed(() => Route.GROUP.url + props.group.id)
   const thumbSize  = computed(() => props.size ?? (viewMgr.isXs ? viewStore.thumbSize.galleryXsSize : viewStore.thumbSize.gallerySize))
   const cardWidth = computed(() => viewMgr.isXs ? 
      windowWidth.value * MaxWidths.xsSizes.get(thumbSize.value) :
      MaxWidths.sizes.get(thumbSize.value)
   )
   
   const image = computed(() => { 
      for (const image of props.group.images) {
         if (image.active && image.imageType == ImageType.GROUP) { 
            console.log("thumbUrl", image.thumbUrl)
            return image }
      }
      return null
   })
</script>

<style>
.group-card {
  border-radius: 40px 0 0 40px !important;
}
</style>
