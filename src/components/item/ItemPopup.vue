<template>
   <div class="image-popup" :style="popupStyle">
      <RouterLink v-if="popupImage.itemURL" :to="popupImage.itemURL">
          <v-img :src="popupImage.url" @mouseover="mouseover()" @mouseleave="mouseleave()"/>
      </RouterLink>
      <v-img v-else :src="popupImage.url"/>
      <div v-if="popupImage.name.length" class="text-white">{{ popupImage.name }}</div>
   </div>
</template>

<script setup>
   import { computed, onErrorCaptured } from 'vue'
   import { useSwipeStore } from '../wall/SwipeStore'
   import { handleError } from '@/utils/utils'
   
   const props = defineProps({ popupImage: Object })
   const swipeStore = useSwipeStore()
   
   onErrorCaptured((err) => { return handleError(err, "ItemPopup") })
  
   const popupStyle = computed(() => { 
      const y =  props.popupImage.y > 5 ? props.popupImage.y : 5
      return  "position:fixed; z-index:10; " + 
              "left:" +  props.popupImage.x + "px; top: " +  y + "px; " +
              "width:" + props.popupImage.width + "px; height: " + props.popupImage.height + "px;"
   })     

   const mouseover  = () => { swipeStore.setPopupMouseoverActive(true) }
   const mouseleave = () => { swipeStore.setPopupMouseoverActive(false) }
</script>

<style>
.image-popup {
   background-color: black;
   border: 5px solid; 
}
</style>
