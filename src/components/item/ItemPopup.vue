<template>
   <div class="image-popup" :style="popupStyle">
      <v-img :src="popupImage.url"></v-img>
      <div v-if="popupImage.name.length" class="text-white">{{ popupImage.name }}</div>
   </div>
</template>

<script setup>
   import { computed, onErrorCaptured, ref } from 'vue'
   import { useLogStore }  from '@/stores/logStore'
   import { handleError } from '@/utils/utils'
   
   const props = defineProps({ popupImage: Object })
   const logStore = useLogStore()
   
   onErrorCaptured((err) => { return handleError(err, "ItemPopup", logStore) })
  
   const popupStyle = computed(() => { 
      const y =  props.popupImage.y > 5 ? props.popupImage.y : 5
      return  "position:fixed; z-index:10; " + 
              "left:" +  props.popupImage.x + "px; top: " +  y + "px; " +
              "width:" + props.popupImage.width + "px; height: " + props.popupImage.height + "px;"
   })     
</script>

<style>
.image-popup {
   background-color: black;
   border: 5px solid; 
}
</style>
