<template>
   <v-card :width="wallItem.thumbWidth" ref="cardRef" class="mb-5 d-flex flex-column text-center bg-black">
      <RouterLink :to="itemURL">
         <v-img :src="wallItem.thumbUrl" @mouseover="mouseover()" @mouseleave="mouseleave()" />
      </RouterLink>
      <div class="mx-1 text-white" :class="textClass"> {{ wallItem.title }} </div>
   </v-card>
</template>

<script setup>
   import { computed, onMounted, ref, watch } from 'vue'
   import { breakpointsTailwind, useBreakpoints } from '@vueuse/core'
   import { useItemMgr }    from '@/stores/itemMgr'
   import { useSwipeStore } from './SwipeStore'
   import { objAspectRatio } from '@/utils/utils'
   import { Emit } from '@/utils/constants'
   
   const props = defineProps({ wallItem:Object, origin:String, row:Number, active:Boolean })
   const emit  = defineEmits([ Emit.POPUP, Emit.LOADED ])
   const breakpoints = useBreakpoints(breakpointsTailwind)
   const xs = breakpoints.smaller('sm')
   const itemMgr    = useItemMgr()
   const swipeStore = useSwipeStore()
   const cardRef = ref(null)
   const mouseleaveTime = ref(Date.now())   

   onMounted(() => { emit(Emit.LOADED) })
   watch(() => props.active, (isActive) => {
      // bypass first slide becasue wall rows not all set, which leads to it being placed incorrectly
      if (isActive && swipeStore.firstActiveSlideDisplayed) { 
         swipeStore.setFirstActiveSlideDisplayed(false)
         return 
      }
     
      // display popup in top row if no mouseover or other active popup
      if (isActive && !swipeStore.thumbMouseoverActive && !swipeStore.transitionPopupActive && props.row == 0) {
         setTimeout(() => {   
            const popup = getPopupImage({ overlayThumb: true }) // wait for transition to complete for correct popup coords
            if (popup) {   
               // emit popup so it can be displayed outside of slider stacking order 
               popup.itemURL = itemURL.value
               swipeStore.setTransitionPopupActive(true)
               emit(Emit.POPUP, popup)
            }
         }, 250)
         setTimeout(() => { 
            if (!swipeStore.popupMouseoverActive) { 
               swipeStore.setTransitionPopupActive(false)
               emit(Emit.POPUP, null)
            }
         }, 4000)  
      }
      // else if (isActive && props.row == 0) {
      //    const thumbActive      = swipeStore.thumbMouseoverActive  ? " thumbMouseoverActive"  : "" 
      //    const transitionActive = swipeStore.transitionPopupActive ? " transitionPopupActive" : ""
      //    console.log("Active thumb not displayed: " + thumbActive + transitionActive)
      // }
   })

   const wallItem  = computed(() => props.wallItem) 
   const itemURL   = computed(() => itemMgr.itemURL(props.wallItem.itemId, props.origin, props.wallItem.childNum))
   const textClass = computed(() => xs.value ? "text-caption" : "")
   
   const getPopupImage = (settings) => { 
      if (!cardRef.value) { return null }
      
      const thumbBoundingRect = cardRef.value.$el.getBoundingClientRect()
      if (thumbBoundingRect.y < 0) { return null } // thumbnail not visible to user 

      const popupAspectRatio = objAspectRatio(props.wallItem.popupDimensions)
      return itemMgr.getPopupImage(
         wallItem.value.name, 
         wallItem.value.artist ? wallItem.value.artist.fullName : null, 
         wallItem.value.popupUrl,
         thumbBoundingRect,  
         popupAspectRatio, 
         { ...settings, smallThumb: xs.value })
   }

   const mouseover = () => {
      if (xs.value) { return }

      const mouseoverTime = Date.now()
      setTimeout(() => { 
         if (mouseoverTime > mouseleaveTime.value) { 
            // emit popup so it can be displayed outside of slider stacking order 
            swipeStore.setThumbMouseoverActive(true)
            emit(Emit.POPUP, getPopupImage( {} ))
         }
      }, 250)  
   }

   const mouseleave = () => {
      mouseleaveTime.value = Date.now()
      swipeStore.setThumbMouseoverActive(false)
      emit(Emit.POPUP, null)
   }
</script>

<style>
</style>
