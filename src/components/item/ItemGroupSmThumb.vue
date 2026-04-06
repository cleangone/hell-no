<template>
   <v-row class="d-flex justify-center" :style="widthStyle">
      <img v-for="(childItem, index) in item.childItems" :key="childItem.id" 
         :src="childItem.primaryImage.thumbUrl" :height="height"
         @mouseover="mouseover(childItem)" @mouseleave="mouseleave()"
         :class="index==0 ? 'first-thumb' : 'next-thumb'"/>
   </v-row>
</template>

<script setup>
   import { computed, ref } from 'vue'
   import { useItemMgr } from '@/stores/itemMgr'
   import { Emit } from '@/utils/constants'
   
   const props = defineProps({ item:Object, height:Number })
   const emit  = defineEmits([ Emit.ITEM ])
   const itemMgr = useItemMgr()
   const mouseoverTime  = ref(Date.now())   
   const mouseleaveTime = ref(Date.now())
   
   const widthStyle = computed(() => { 
      let totalWidth = 15
      for (const childItem of props.item.childItems) {
         const aspectRatio = itemMgr.itemAspectRatio(childItem)
         const childWidth = aspectRatio ? Math.round(props.height * aspectRatio) : 60 
         totalWidth += childWidth
      }
      return "min-width:" + totalWidth + "px; max-width:" + totalWidth + "px;max-height:" + props.height + "px"
   })

   const mouseover = (childItem) => {
      mouseoverTime.value = Date.now()     
      emit(Emit.ITEM, childItem)
   }

   const mouseleave = () => {
      mouseleaveTime.value = Date.now()
      setTimeout(() => { 
         if (mouseleaveTime.value > mouseoverTime.value ) { emit(Emit.ITEM, null) }
      }, 250)
   }
</script>

<style>
.first-thumb {
   border: 2px solid black; 
   float: left;
}
.next-thumb {
   border-top:    2px solid black; 
   border-bottom: 2px solid black; 
   border-right:  2px solid black; 
   float: left;
}
</style>
