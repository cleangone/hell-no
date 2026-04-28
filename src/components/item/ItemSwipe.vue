<template>
   <div ref="swipeEle" :style="{transform:transform, transition:transition, touchAction:'none'}"> <!-- :setup="..." -->
      <v-img v-if="showImage" :src="imageUrl"/>
      <div v-if="showText" :style="slideStyle" class="mt-n2 pt-3 px-1 text-left swipe-container">
         <div v-if="artist" class="text-h6">{{ artist }}</div>
         <div v-if="populated(props.item.subtitle)" class="font-weight-medium">{{ props.item.subtitle }}</div>
         <div v-html="props.item.desc"></div>
      </div>
   </div>
 </template>
 
 <script setup>
   import { computed, onUnmounted, onMounted, ref } from 'vue'
   import {useWindowSize } from '@vueuse/core'
   import interact from "interactjs"
   import { populated } from '@/utils/utils'
   import { Emit } from '@/utils/constants'
  
   const TRANSITION = "transform 0.5s cubic-bezier(0.25, 0.75, 0.5, 1.25)"
   const THRESHOLD_X = 50
   const THRESHOLD_Y = 70
   const INFINITE_X = 500
   const INFINITE_Y = 900
 
   const props = defineProps({ item:Object, canSwipeLeft:Boolean, canSwipeRight:Boolean, canSwipeUp:Boolean, canSwipeDown:Boolean })
   const emit  = defineEmits([ Emit.SWIPE_LEFT, Emit.SWIPE_RIGHT, Emit.DONE ])
   const { height: windowHeight } = useWindowSize()
   const swipeEle = ref(null)
   const showImage = ref(false)
   const showText  = ref(false)
   const slideStyle = ref("")
   const prevEmit = ref(null)
   const isDragging = ref(true)
   const position = ref({ x: 0, y: 0 })

   onMounted(() => { 
      // console.log(props.item.name + (props.item.isTop ? " top" : ""))
      if (props.item.isTop) { 
         // top slide displays the image first, and then the text 
         // otherwise the text will display first causing a flash when the image is displayed
         showImage.value = true 
         setTimeout(() => { showText.value  = true }, 500) 

         // top slide needs to fill the screen to keep the bot from showing behind a shorter top  
         slideStyle.value = "min-height:" + windowHeight.value + "px;"
      }
      else {
         // bottom slide display delayed until after top
         setTimeout(() => { showImage.value = true }, 300) 
         
         // bottom text shows after image to prevent flashing during swipe
         setTimeout(() => { showText.value  = true }, 1000) 
      }    

      const element = swipeEle.value
      interact(element).draggable({
         onstart: () => { 
            isDragging.value = true 
            prevEmit.value = null
         },
         onmove: (event) => {
            const x = position.value.x + event.dx
            const y = position.value.y + event.dy
            emitSwipeDirectionChange(x<0 ? Emit.SWIPE_LEFT : Emit.SWIPE_RIGHT) 
            setPosition({ x, y })
         },
         onend: () => {
            const { x, y } = position.value
            isDragging.value = false
   
            if (x < -THRESHOLD_X)      { onThresholdReached(Emit.SWIPE_LEFT) }
            else if (x >  THRESHOLD_X) { onThresholdReached(Emit.SWIPE_RIGHT) }
            else if (y < -THRESHOLD_Y) { onThresholdReached(Emit.SWIPE_UP) }
            else if (y >  THRESHOLD_Y) { onThresholdReached(Emit.SWIPE_DOWN) }
            else setPosition({ })
         }
      })
   })

   onUnmounted(() => { 
      unsetInteractElement()
   })
   
   const imageUrl = computed(() => props.item.primaryImage.url)
   const artist   = computed(() => props.item.primaryArtist ? props.item.primaryArtist.fullName : null)
   
   const transform = computed(() => {
      const { x, y } = position.value
      return `translate3D(${x}px, ${y}px, 0) rotate(0deg)`
   })

   const transition = computed(() => isDragging.value ? "" : TRANSITION)

   const canSwipe = (swipeEmit) => { 
      if (swipeEmit == Emit.SWIPE_LEFT) { return props.canSwipeLeft }
      else if (swipeEmit == Emit.SWIPE_RIGHT) { return props.canSwipeRight }
      else if (swipeEmit == Emit.SWIPE_UP)    { return props.canSwipeUp }
      else if (swipeEmit == Emit.SWIPE_DOWN)  { return props.canSwipeDown }
      return false
   }

   const emitSwipeDirectionChange = (swipeEmit) => {
      if (prevEmit.value != swipeEmit) {
         prevEmit.value = swipeEmit
         emit(swipeEmit, props.item.name)
      }
   }

   const onThresholdReached = (swipeEmit) => {
      unsetInteractElement()
      if (swipeEmit == Emit.SWIPE_LEFT)       { setPosition({ x: canSwipe(swipeEmit) ? -INFINITE_X : 0 }) }
      else if (swipeEmit == Emit.SWIPE_RIGHT) { setPosition({ x: canSwipe(swipeEmit) ?  INFINITE_X : 0 }) }
      else if (swipeEmit == Emit.SWIPE_UP)    { setPosition({ y: canSwipe(swipeEmit) ? -INFINITE_Y : 0 }) }
      else if (swipeEmit == Emit.SWIPE_DOWN)  { setPosition({ y: canSwipe(swipeEmit) ?  INFINITE_Y : 0 }) }
      
      if (canSwipe(swipeEmit)) { emit(Emit.DONE, swipeEmit, props.item.name) }
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
