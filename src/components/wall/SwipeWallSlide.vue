<template>
   <v-card :width="wallItem.wallImageWidth" ref="cardRef" class="d-flex flex-column text-center bg-black">
      <div class="ma-1">
         <RouterLink :to="itemURL">
            <v-img :src="wallItem.wallImageUrl" @mouseover="mouseover()" @mouseleave="mouseleave()"/>
         </RouterLink>
         <div v-if="topRow" class="text-white">{{ wallItem.title }}</div>  
      </div>
   </v-card>
</template>

<script setup>
   import { computed, ref } from 'vue'
   import { useItemMgr }    from '@/stores/itemMgr'
   import { useSwipeStore } from './SwipeStore'
   import { useViewMgr }    from '@/stores/viewMgr'
   import { objAspectRatio } from '@/utils/utils'
   import { Emit } from '@/utils/constants'
   
   const props = defineProps({ wallItem:Object, origin:String, row:Number })
   const emit  = defineEmits([ Emit.POPUP ])

   const itemMgr    = useItemMgr()
   const swipeStore = useSwipeStore()
   const viewMgr    = useViewMgr()
   const cardRef = ref(null)
   const mouseleaveTime = ref(Date.now())   

   const topRow  = computed(() => props.wallItem.wallRow == 1)
   const itemURL = computed(() => itemMgr.itemURL(props.wallItem.itemId, props.origin, props.wallItem.childNum))
      
   const getPopupImage = () => { 
      if (!cardRef.value) { return null }
      
      const thumbBoundingRect = cardRef.value.$el.getBoundingClientRect()
      if (thumbBoundingRect.y < 0) { return null } // thumbnail not visible to user 
      
      const popupAspectRatio = objAspectRatio(props.wallItem.popupDimensions)
      return itemMgr.getPopupImage(
         props.wallItem.name, 
         props.wallItem.artist ? props.wallItem.artist.fullName : null, 
         props.wallItem.popupUrl,
         thumbBoundingRect,  
         popupAspectRatio)
   }

   const mouseover = () => {
      if (viewMgr.isXs) { return }
      const mouseoverTime = Date.now()
      setTimeout(() => { 
         if (mouseoverTime > mouseleaveTime.value) { 
            swipeStore.setThumbMouseoverActive(true)
            emit(Emit.POPUP, getPopupImage())
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
