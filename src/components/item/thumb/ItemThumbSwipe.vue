<template>
   <div ref="swipeEle" :style="{transform:transform, transition:transition, touchAction:'none'}">
      <v-img :src="props.item.primaryImage.thumbUrl"></v-img>
      <div class="font-weight-bold bg-white">{{ props.item.name }}</div>
      <div v-if="artist" class="bg-white">{{ artist }}</div>
   </div>
 </template>
 
 <script setup>
   import { computed, onUnmounted, onMounted, ref } from 'vue'
   import interact from "interactjs"
   import { Emit } from '@/utils/constants'
  
   const TRANSITION = "transform 0.5s cubic-bezier(0.25, 0.75, 0.5, 1.25)"
 
   const props = defineProps({
      item:              { type: Object,  required: true },
      hasBottomItem:     { type: Boolean, required: false, default: false },
      thresholdX:        { type: Number,  required: false, default: 50  },
      thresholdY:        { type: Number,  required: false, default: 70  },
      outOfSightXOffset: { type: Number,  required: false, default: 500 },
      outOfSightYOffset: { type: Number,  required: false, default: 500 },
   })
   const emit = defineEmits([Emit.SWIPE_LEFT, Emit.SWIPE_RIGHT, Emit.SWIPE_UP, Emit.SWIPE_DOWN, Emit.DONE])

   const swipeEle = ref(null)
   const isDragging = ref(true)
   const prevEmit = ref(null)
   const position = ref({ x: 0, y: 0 })

   onMounted(() => { 
      const element = swipeEle.value
      interact(element).draggable({
         onstart: () => { isDragging.value = true },
         onmove: (event) => {
            const x = position.value.x + event.dx
            const y = position.value.y + event.dy

            // emit start of a new swipe direction 
            if (Math.abs(x) > Math.abs(y)) { 
               emitSwipeDirectionChange(x<0 ? Emit.SWIPE_LEFT : Emit.SWIPE_RIGHT) 
            }
            else {
               emitSwipeDirectionChange(y<0 ? Emit.SWIPE_UP : Emit.SWIPE_DOWN) 
            }

            setPosition({ x, y })
         },
         onend: () => {
            const { x, y } = position.value
            const { thresholdX, thresholdY } = props
            isDragging.value = false
   
            if (x < -thresholdX)      { onThresholdReached(Emit.SWIPE_LEFT) }
            else if (x > thresholdX)  { onThresholdReached(Emit.SWIPE_RIGHT) }
            else if (y < -thresholdY) { onThresholdReached(Emit.SWIPE_UP) }
            else if (y > thresholdY)  { onThresholdReached(Emit.SWIPE_DOWN) }
            
            else setPosition({ })
         }
      })
   })
   
   const emitSwipeDirectionChange = (swipeEmit) => {
      if (prevEmit.value != swipeEmit) {
         prevEmit.value = swipeEmit
         emit(swipeEmit, props.item.name)
      }
   }
   
   onUnmounted(() => { 
      unsetInteractElement()
   })

   const artist = computed(() => props.item.primaryArtist ? props.item.primaryArtist.fullName : null)

   const transform = computed(() => {
      const { x, y } = position.value
      return `translate3D(${x}px, ${y}px, 0) rotate(0deg)`
   })

   const transition = computed(() => isDragging.value ? "" : TRANSITION)

   const onThresholdReached = (swipeEmit) => {
      const { hasBottomItem, outOfSightXOffset, outOfSightYOffset } = props
      unsetInteractElement()
      if (swipeEmit == Emit.SWIPE_LEFT) { 
         setPosition(hasBottomItem ? { x: -outOfSightXOffset } : {}) 
      }
      else if (swipeEmit == Emit.SWIPE_RIGHT) { 
         setPosition(hasBottomItem ? { x: outOfSightXOffset } : {}) 
      }
      else if (swipeEmit == Emit.SWIPE_UP)   { setPosition({ y: -outOfSightYOffset }) }
      else if (swipeEmit == Emit.SWIPE_DOWN) { setPosition({ y: outOfSightYOffset  }) }
      
      emit(Emit.DONE, swipeEmit, props.item.name)
   }
  
   const setPosition = (newPosition) => {
      const { x=0, y=0 } = newPosition
      position.value = { x, y }
   }

   const unsetInteractElement = () => {
      // console.log("unsetInteractElement")
   }
</script>

<style>
</style>
