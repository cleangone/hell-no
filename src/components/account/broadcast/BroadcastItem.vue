<template>
   <div class="broadcast-thumb text-center pointer">
      <v-img :src="broadcastItem.primaryImage.largeThumbUrl" @click="showFullscreenDialog=true"/>
      <div class="text-white">{{ broadcastItem.name }}</div>
   </div>
      
   <v-dialog v-model="showFullscreenDialog" width="auto">
      <FullscreenImage :item="broadcastItem" @done="showFullscreenDialog=false"/>
   </v-dialog>  
</template>

<script setup>
   import { onMounted, ref } from 'vue'
   import FullscreenImage from './FullscreenImage.vue'
   import { useViewMgr } from '@/stores/viewMgr'
   
   const props = defineProps({ broadcastItem: Object })
   const viewMgr = useViewMgr()
   const showFullscreenDialog = ref(false)

   onMounted(() => { 
      viewMgr.addHit(props.broadcastItem.id)
   })
</script>

<style>
.broadcast-thumb {
   background-color: black;
   border: 5px solid; 
   width: 200px;
}
</style>