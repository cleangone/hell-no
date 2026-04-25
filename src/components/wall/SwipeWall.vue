<template>
   <!-- <div class="wall-container bg-shade px-3"> -->
   <div class="wall-container px-3" :class="background">
      <swiper v-for="(slideRow, index) in slideRows" key="slideRow.id" slides-per-view="auto" :space-between="spaceBetweenSlides" 
            :pagination="{clickable: true}" :navigation="true" :loop="true" @sliderMove="onSliderMove"
            :autoplay="{ delay:4000, pauseOnMouseEnter:true }" :modules="modules" style="--swiper-navigation-size:20px"
            :style="rowStyle">
         <swiper-slide v-for="slideItem in slideRow.items" :key="slideItem.itemId" :width="slideItem.width" 
               v-slot="{ isActive }" class="swipe-slide" :style="slideStyle"> 
            <SwipeWallSlide :wallItem="slideItem" :origin="ItemOrigin.WALL" :row=index :active="isActive"
               @loaded="onSlideLoaded" @popup="onPopup"/>
         </swiper-slide>
      </swiper>
   </div>
   <ItemPopup v-if="popupImage" :popupImage="popupImage"/>
</template>

<script setup>
   import { computed, onErrorCaptured, onMounted, ref } from 'vue'
   import { breakpointsTailwind, useBreakpoints } from '@vueuse/core'
   import { Swiper, SwiperSlide } from "swiper/vue"
   import { Autoplay, Navigation, Pagination } from 'swiper/modules'
   import { useViewStore }  from '@/stores/viewStore'
   import SwipeWallSlide from './SwipeWallSlide.vue'
   import ItemPopup      from '@/components/item/ItemPopup.vue'
   import { handleError } from '@/utils/utils'
   import { Emit, ItemOrigin, URL, WallDisplayOrder, WallRowHeight } from '@/utils/constants'
   import 'swiper/css'
   import 'swiper/css/navigation'
   import 'swiper/css/pagination'

   const props = defineProps({ wall:Object, rowHeight:Number, linkUrl:String, transparent:Boolean })
   const emit  = defineEmits([ Emit.LOADED ])
   const breakpoints = useBreakpoints(breakpointsTailwind)
   const xs = breakpoints.smaller('sm')
   const viewStore = useViewStore()
   const modules = ref([Autoplay, Navigation, Pagination])
   const popupImage = ref(null)
   
   onErrorCaptured((err) => { return handleError(err, "SwipeWall") })

   const background = computed(() => props.transparent ? "" : "bg-shade" )

   const wallItems = computed(() => {
      const sizedWallItems = []
      if (props.rowHeight == WallRowHeight.DEFAULT) { sizedWallItems.push( ...props.wall.wallItems ) }
      else {
         for (const wallItem of props.wall.wallItems) {
             const sizedWallItem = { ...wallItem }
            sizedWallItem.width = sizedWallItem.width * WallRowHeight.XS /  WallRowHeight.DEFAULT - 10
            sizedWallItems.push(sizedWallItem)
         }
      }

      const rows = getRowContainter()
      let usePreviousWallOrder = rows.length == viewStore.previousWallOrder.rows.length
      if (usePreviousWallOrder) {
         for (const wallItem of sizedWallItems) {
            if (!viewStore.previousWallOrder.itemIds.includes(wallItem.itemId)) { usePreviousWallOrder = false }
         }
      }

      // console.log("usePreviousWallOrder", usePreviousWallOrder)   
      if (usePreviousWallOrder) {
         const itemIdToWallItem  = new Map(sizedWallItems.map((obj) => [obj.itemId, obj]))

         const previousOrderWallItems = []
         let rowIndex = 0
         for (const row of viewStore.previousWallOrder.rows) {   
            for (const itemId of row) {   
               const wallItem = { ...itemIdToWallItem.get(itemId) }
               wallItem.wallRow = rowIndex + 1
               previousOrderWallItems.push(wallItem)
            }
            rowIndex++
         }

         return previousOrderWallItems // no need to update previousWallOrder
      }
      else if (props.wall.displayOrder == WallDisplayOrder.RANDOM_IN_ROW) { 
         for (const wallItem of sizedWallItems) {    
            if (wallItem.wallRow) {  
               const randomWallItem = { ...wallItem, random: Math.random() }
               rows[wallItem.wallRow - 1].items.push(randomWallItem)
            }
         }

         const randomInRowWallItems = []
         for (const row of rows) {   
            row.items.sort(function(a, b){return a.random - b.random}) 
            randomInRowWallItems.push( ...row.items )
         }

         setPreviousWallOrder(rows)
         return randomInRowWallItems
      }
      else if (props.wall.displayOrder == WallDisplayOrder.RANDOM) { 
         const randomWallItems = []
         for (const wallItem of sizedWallItems) {    
            const randomWallItem = { ...wallItem, random: Math.random() }
            randomWallItems.push(randomWallItem)
         }
         randomWallItems.sort(function(a, b){return a.random - b.random}) 

         let rowIndex = 0
         for (const wallItem of randomWallItems) {   
            wallItem.wallRow = rowIndex + 1
            rows[rowIndex].items.push(wallItem)
            rowIndex = rowIndex == rows.length - 1 ? 0 : rowIndex+1 
         } 
         
         const sortedWallItems = []
         for (const row of rows) {   
            sortedWallItems.push( ...row.items) 
         } 

         setPreviousWallOrder(rows)
         return sortedWallItems
      }
      else {
         for (const wallItem of sizedWallItems) {    
            rows[wallItem.wallRow - 1].items.push(wallItem)
         }

         setPreviousWallOrder(rows)
         return sizedWallItems
      }
   })

   const setPreviousWallOrder = (rows) => { 
      const newWallOrder = { 
         itemIds: [],  // all itemIds in wall
         rows: [] }    // each row contains an array of itemIds
      
      for (const row of rows) {   
         const rowItemIds = row.items.map((obj) => obj.itemId)
         newWallOrder.itemIds.push( ...rowItemIds )
         newWallOrder.rows.push(rowItemIds)
      } 
      viewStore.setPreviousWallOrder(newWallOrder) 
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
                  url: wallItem.url, 
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
