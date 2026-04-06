<template>
   <v-card ref="cardRef" variant="flat" style="z-index: 1" class="d-flex flex-column thumb-container">
      <ItemGroupSmThumb v-if="isItemGroup" :item="item" @click="click(item)" 
         @item="itemGroupMouseover" :height="40" class="my-0 mx-1" :class="pointerClass"/>             
      <img v-else :src="item.primaryImage.thumbUrl" @click="click()" height="40"
         @mouseover="mouseover(item)" @mouseleave="mouseleave()" class="my-0 mx-1" :class="pointerClass"/>
   </v-card>
   <span v-if="imageCount && item.imageCount>1" class="ml-1">({{ item.imageCount }})</span>
            
   <ItemPopup v-if="popup" :popupImage="popup"/>
</template>

<script setup>
   import { computed, ref } from 'vue'
   import { breakpointsTailwind, useBreakpoints } from '@vueuse/core'
   import { useItemMgr } from '@/stores/itemMgr'
   import ItemGroupSmThumb from '@/components/item/ItemGroupSmThumb.vue'
   import ItemPopup        from '@/components/item/ItemPopup.vue'
   import { Emit } from '@/utils/constants'
   
   const props = defineProps({ item: Object, imageCount: Boolean, pointer: Boolean })
   const emit  = defineEmits([ Emit.SELECT ])
   const breakpoints = useBreakpoints(breakpointsTailwind)
   const xs = breakpoints.smaller('sm')
   const itemMgr = useItemMgr()
   const cardRef = ref(null)
   const popup = ref(null)
   const mouseleaveTime = ref(Date.now())
   
   const isItemGroup  = computed(() => itemMgr.isItemGroup(props.item))
   const pointerClass = computed(() => props.pointer ? "pointer" : "")
   
   const click = () => { 
      mouseleave()
      emit(Emit.SELECT, props.item) 
   }

   const itemGroupMouseover = (childItem) => { 
      if (childItem) { setPopup(childItem) }
      else { mouseleave () }
   }
   
   const mouseover = () => {
      if (xs.value) { return }

      const mouseoverTime = Date.now()     
      setTimeout(() => {  // debounce mouseover 
         if (mouseoverTime > mouseleaveTime.value ) { setPopup(props.item) }
      }, 250)  
   }

   const mouseleave = () => {
      mouseleaveTime.value = Date.now()
      popup.value = null 
   }

   const setPopup = (item) => {
      const boundingRect = cardRef.value.$el.getBoundingClientRect()
      const aspectRatio = itemMgr.itemAspectRatio(item)
      popup.value = itemMgr.getPopupImage("", "", item.primaryImage.largeThumbUrl, boundingRect, aspectRatio)
   }
</script>

<style>
</style>
