<template>
   <div class="wall-container px-3" :class="background">
      <swiper v-for="(slideRow, index) in slideRows" key="slideRow.id" slides-per-view="auto" :space-between="spaceBetweenSlides" 
            :pagination="{clickable: true}" :navigation="true" :loop="true" @sliderMove="onSliderMove"
            :autoplay="{ delay:4000, pauseOnMouseEnter:true }" :modules="modules" :style="rowStyle" 
            style="--swiper-navigation-size:20px; --swiper-pagination-color: var(--color-link);">
         <swiper-slide v-for="slideItem in slideRow.items" :key="slideItem.itemId" :width="slideItem.width" 
               v-slot="{ isActive }" class="swipe-slide" :style="slideStyle"> 
            <SwipeWallSlide :wallItem="slideItem" :origin="ItemOrigin.WALL" :row=index :active="!xs && isActive"
               @loaded="onSlideLoaded" @popup="onPopup"/>
         </swiper-slide>
      </swiper>
   </div>
   <ItemPopup v-if="popupImage" :popupImage="popupImage"/>
</template>

<script setup>
   import { computed, onErrorCaptured, onMounted, onUnmounted, ref, watch } from 'vue'
   import { breakpointsTailwind, useBreakpoints } from '@vueuse/core'
   import { storeToRefs } from 'pinia'
   import { Swiper, SwiperSlide } from "swiper/vue"
   import { Autoplay, Navigation, Pagination } from 'swiper/modules'
   import { useSwipeStore } from './SwipeStore'
   import { useViewStore }  from '@/stores/viewStore'
   import SwipeWallSlide from './SwipeWallSlide.vue'
   import ItemPopup      from '@/components/item/ItemPopup.vue'
   import { handleError, randomizeArray } from '@/utils/utils'
   import { Defaults, Emit, ItemOrigin, URL, WallRowHeight } from '@/utils/constants'
   import 'swiper/css'
   import 'swiper/css/navigation'
   import 'swiper/css/pagination'

   const props = defineProps({ wall:Object, rowHeight:Number, profileId:String, linkUrl:String, transparent:Boolean })
   const emit  = defineEmits([ Emit.LOADED ])

   const breakpoints = useBreakpoints(breakpointsTailwind)
   const xs = breakpoints.smaller('sm')
   const swipeStore = useSwipeStore()
   const viewStore  = useViewStore()
   const modules = ref([Autoplay, Navigation, Pagination])
   const { popupMouseoverActive } = storeToRefs(swipeStore)
   const popupImage = ref(null)
   
   onMounted(() => {
      swipeStore.reset()
      window.addEventListener('scroll', handleScroll)
   })
   onUnmounted(() => window.removeEventListener('scroll', handleScroll))
   const handleScroll = () => { if (popupImage.value) { popupImage.value = null } }

   onErrorCaptured((err) => { return handleError(err, "SwipeWall") })

   // take down popup if user mouses away from it
   watch(popupMouseoverActive, (active) => { if (!active) { onPopup(null) } })

   const background = computed(() => props.transparent ? "" : "bg-shade" )

   const wallItems = computed(() => {
      const maxWallItems = props.wall.maxWallItems ? props.wall.maxWallItems : Defaults.MAX_WALL_ITEMS
      const wallItems = []
      if (props.wall.id == Defaults.SITE_ID && props.wall.userWallItems) {
         const maxUserWallItems = Math.floor(maxWallItems/2)
         const randomUserWallItems = randomizeArray(props.wall.userWallItems)
         wallItems.push(...randomUserWallItems.slice(0, maxUserWallItems))
      }

      const wallItemIds = wallItems.map((obj) => obj.itemId) 
      for (const wallItem of props.wall.wallItems) { 
         if (wallItems.length >= maxWallItems) { break }
         else if (!wallItemIds.includes(wallItem.itemId)) { wallItems.push(wallItem) }
      }

      const displayWallItems = []
      if (props.wall.id == Defaults.SITE_ID) { displayWallItems.push( ...wallItems) }
      else {
         for (const wallItem of wallItems) {
            if (!props.profileId && !wallItem.profileId || props.profileId == wallItem.profileId) {
               displayWallItems.push(wallItem) 
            }
         }
      }

      const sizedWallItems  = sizeWallItems(displayWallItems)   
      const randomWallItems = randomizeArray(sizedWallItems)
      let rowIndex = 1
      for (const wallItem of randomWallItems) {   
         wallItem.wallRow = rowIndex
         rowIndex = rowIndex == props.wall.wallRows ? 1 : rowIndex + 1 // round-robin through rows
      } 
      
      return randomWallItems 
   })

   const sizeWallItems = (wallItems) => { 
      const sizedWallItems = []
      if (props.rowHeight == WallRowHeight.DEFAULT) { sizedWallItems.push( ...wallItems ) }
      else {
         for (const wallItem of wallItems) {
            const sizedWallItem = { ...wallItem }
            sizedWallItem.thumbWidth = sizedWallItem.thumbWidth * WallRowHeight.XS /  WallRowHeight.DEFAULT - 10
            sizedWallItems.push(sizedWallItem)
         }
      }
      return sizedWallItems
   }

   const getRowContainter = () => { 
      const rows = [] 
      for (let i=0; i<props.wall.wallRows; i++) {
         rows.push({ id: i, items: [] })
      }
      return rows
   }

   const slideRows = computed(() => { 
      const rows = getRowContainter()
      const navItems = []

      for (const wallItem of wallItems.value) {    
         if (wallItem.wallRow) {  
            const index = wallItem.wallRow - 1
            rows[index].items.push(wallItem)

            navItems.push({ 
               id:       wallItem.itemId, 
               childNum: wallItem.childNum,
               name:     wallItem.name, 
               primaryImage: { 
                  thumbUrl: wallItem.thumbUrl, 
                  url: wallItem.popupUrl, 
                  dimensions: wallItem.thumbDimensions ? wallItem.thumbDimensions : wallItem.dimensions // backward compatible
               } 
            })
         }
      }

      viewStore.setVisibleItems(ItemOrigin.WALL, "Art Wall", props.linkUrl ? props.linkUrl : URL.HOME, navItems) 
      return rows
   }) 
   
   const spaceBetweenSlides = computed(() => xs.value ? 20 : 30) 
   const rowMargin          = computed(() => xs.value ? 5 : 0) 
   const slideMargin        = computed(() => xs.value ? 25 : 5) 
   const rowStyle   = computed(() => "min-height:" + (props.rowHeight + rowMargin.value)   + "px") 
   const slideStyle = computed(() => "height:"     + (props.rowHeight + slideMargin.value) + "px") 
   const onPopup = (popup)  => { popupImage.value = popup }
   const onSlideLoaded = () => { emit(Emit.LOADED) }
   const onSliderMove = ()  => { popupImage.value = null }
</script>

<style>
.wall-container {
   width: 100%;
   height: 100%;
   position: relative;
}
.swipe-slide {
   display: flex;
   justify-content: center;
   align-items: center;
   width: fit-content;
   position: relative;
}
.swiper-button-prev ,
.swiper-button-next {
   background-color: white;
   background-position: center;
   background-size: 40px;
   background-repeat: no-repeat;
   padding: 15px 15px;
   border-radius: 100%;
   border: 2px solid black;
}
</style>
