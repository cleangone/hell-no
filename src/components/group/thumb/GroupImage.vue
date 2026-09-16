<template>
   <v-card :height="height" :width="width" flat class="image-card bg-black">
      <v-img :src="src" cover class="image-only-tails"/>
   </v-card>
</template>

<script setup>
   import { computed } from 'vue'
   import { ThumbAspectRatio } from '@/utils/constants'
   
   const props = defineProps({ src: String, height: Number, cardClass: String })

   const width = computed(() => props.height * ThumbAspectRatio.GROUP)
</script>

<style>

.image-card {
   border-radius: 60px 5px 5px 60px !important;
   overflow: hidden;
   clip-path: polygon(0% 0%, 100% 0%, 90% 50%, 100% 100%, 0% 100%) !important;
   -webkit-clip-path: polygon(0% 0%, 100% 0%, 90% 50%, 100% 100%, 0% 100%) !important;
}
.image-only-tails { 
   margin: 4px;
   height: calc(100% - 8px) !important;
   width: calc(100% - 8px) !important;
   border-radius: inherit !important; 
   clip-path: polygon(
      0% 0%, 
      calc(100% - 2px) 0%, 
      calc(90% - 2px) 50%, 
      calc(100% - 2px) 100%, 
      0% 100%
   ) !important;
   -webkit-clip-path: polygon(
      0% 0%, 
      calc(100% - 2px) 0%, 
      calc(90% - 2px) 50%, 
      calc(100% - 2px) 100%, 
      0% 100%
   ) !important;
}

</style>
