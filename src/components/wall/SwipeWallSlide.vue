<template>
   <v-card :width="wallItem.width" ref="cardRef" class="mb-5 d-flex flex-column text-center bg-black">
      <RouterLink :to="itemURL">
         <v-img :src="wallItem.thumbUrl" @mouseover="mouseover()" @mouseleave="mouseleave()" />
      </RouterLink>
      <div class="mx-1 text-white" :class="textClass"> {{ wallItem.title }} </div>
   </v-card>
</template>

<script setup>
   import { computed, onMounted, ref } from 'vue'
   import { breakpointsTailwind, useBreakpoints } from '@vueuse/core'
   import { useItemMgr } from '@/stores/itemMgr'
   import { objAspectRatio } from '@/utils/utils'
   import { Emit } from '@/utils/constants'
   
   const props = defineProps({ wallItem:Object, origin:String })
   const emit  = defineEmits([ Emit.POPUP, Emit.LOADED ])
   const breakpoints = useBreakpoints(breakpointsTailwind)
   const xs = breakpoints.smaller('sm')
   const itemMgr = useItemMgr()
   const cardRef = ref(null)
   const mouseleaveTime = ref(Date.now())

   onMounted(() => { emit(Emit.LOADED) })

   const wallItem  = computed(() => props.wallItem) 
   const itemURL   = computed(() => itemMgr.itemURL(props.wallItem.itemId, props.origin, props.wallItem.childNum))
   const textClass = computed(() => xs.value ? "text-caption" : "")
     
   const mouseover = () => {
      if (xs.value) { return }

      const mouseoverTime = Date.now()
      setTimeout(() => { 
         if (mouseoverTime > mouseleaveTime.value) { 
            const boundingRect = cardRef.value.$el.getBoundingClientRect()
            const aspectRatio = objAspectRatio(props.wallItem.dimensions)
            const popupImage = itemMgr.getPopupImage(
               wallItem.value.name, 
               wallItem.value.artist ? wallItem.value.artist.fullName : null, 
               wallItem.value.largeThumbUrl, boundingRect, aspectRatio)

            // emit popup so it can be displayed outside of slider stacking order 
            emit(Emit.POPUP, popupImage)
         }
      }, 250)  
   }

   const mouseleave = () => {
      mouseleaveTime.value = Date.now()
      emit(Emit.POPUP, null)
   }
</script>

<style>
</style>
