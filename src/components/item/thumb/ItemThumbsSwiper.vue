<template>
   <swiper slides-per-view="auto" :space-between="spaceBetweenSlides" loop>
      <swiper-slide v-for="item in items" :key="item.id" :style="slideStyle(item)"> 
         <ItemThumb :item="item" :size="ThumbSize.MED" :origin="ItemOrigin.VIEWED" 
            :showDateViewed="showDateViewed" bypassShowUser emitPopup dense @popup="onPopup"/>
      </swiper-slide>
   </swiper>
   <ItemPopup v-if="popupImage" :popupImage="popupImage"/>
</template>

<script setup>
   import { computed, ref } from 'vue'
   import { Swiper, SwiperSlide } from "swiper/vue"
   import { useItemMgr } from '@/stores/itemMgr'
   import { useViewMgr } from '@/stores/viewMgr'
   import ItemThumb      from './ItemThumb.vue'
   import ItemPopup      from '../ItemPopup.vue'
   import { ItemOrigin, ThumbSize } from '@/utils/constants'
   import 'swiper/css'

   const props = defineProps({ items: Array, showDateViewed: Boolean })

   const itemMgr = useItemMgr()
   const viewMgr = useViewMgr()
   const popupImage = ref(null)
   
   const spaceBetweenSlides = computed(() => viewMgr.isXs ? 5 : 10)

   const slideStyle = (item) => { return "width:" + itemWidth(item) + "px" } 
   const itemWidth  = (item) => {
      const targetHeight = viewMgr.getTargetThumbHeight(ThumbSize.MED)
      return itemMgr.isItemGroup(item) ? 
         itemMgr.getGroupWidth(item, targetHeight) :
         itemMgr.getItemWidth(item, targetHeight, viewMgr.getItemMaxLandscapeWidth(ThumbSize.MED) ) 
   }

   const onPopup = (popup) => { popupImage.value = popup }
</script>

<style>
</style>
