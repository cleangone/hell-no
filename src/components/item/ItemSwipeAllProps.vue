<template>
   <div ref="interactElement"
     :style="{
       transform: transformString,
       transition: transitionString,
       touchAction: 'none',
     }">
     <v-img :src="props.item.primaryImage.thumbUrl"></v-img> 
   </div>
 </template>
 
 <script setup>
   import { computed, onUnmounted, onMounted, ref } from 'vue'
   import interact from "interactjs"
 
   // const INTERACT_ON_START = "start"
   // const INTERACT_ON_MOVE = "move"
   // const INTERACT_ON_END = "end"
   const SWIPE_LEFT = "swipe-left"
   const SWIPE_RIGHT = "swipe-right"
   // const SWIPE_TOP = "swipe-top"
   // const SWIPE_BOTTOM = "swipe-bottom"
   const SWIPE_ANY = "swipe"
 
   const props = defineProps({
      item: {
       type: Object,
       required: true,
     },
     transition: {
       type: String,
       default: "transform 0.5s cubic-bezier(0.2, 0.8, 0.4, 1.2)",
       required: false,
     },
     maxRotation: {
       type: Number,
       default: 5,
       required: false,
     },
     outOfSightXOffset: {
       type: Number,
       default: 500,
       required: false,
     },
     outOfSightYOffset: {
       type: Number,
       default: 500,
       required: false,
     },
     thresholdX: {
       type: Number,
       default: 50,
       required: false,
     },
   //   thresholdY: {
   //     type: Number,
   //     default: 70,
   //     required: false,
   //   }
   })
   const emit = defineEmits([SWIPE_ANY])
   //    INTERACT_ON_START, INTERACT_ON_MOVE, INTERACT_ON_END,
   //    SWIPE_LEFT, SWIPE_RIGHT, SWIPE_ANY //SWIPE_TOP, SWIPE_BOTTOM, 
   // ])

   const interactElement = ref(null)
   const isDragging = ref(true)
   const interactPosition = ref({ x: 0, y: 0, rotation: 0 })

   onMounted(() => { 
      const element = interactElement.value
      interact(element).draggable({
         onstart: () => {
            // emit(INTERACT_ON_START)
            isDragging.value = true
         },
         onmove: (event) => {
            // emit(INTERACT_ON_MOVE)
            // const { maxRotation, thresholdX } = this.$props;

            const x = interactPosition.value.x + event.dx;
            const y = interactPosition.value.y + event.dy;
            // let rotation = props.maxRotation * (x / props.thresholdX)
            // if (rotation > props.maxRotation) { rotation = props.maxRotation }
            // else if (rotation < -props.maxRotation) { rotation = -props.maxRotation }
   
            // setPosition({ x, y, rotation })
            setPosition({ x, y })
         },
         onend: () => {
            // emit(INTERACT_ON_END);
            const { x, y } = interactPosition.value
            const { thresholdX } = props
            isDragging.value = false
   
            if (x > thresholdX)       { onThresholdReached(SWIPE_RIGHT) }
            else if (x < -thresholdX) { onThresholdReached(SWIPE_LEFT) }
            else if (y < -thresholdY) { onThresholdReached(SWIPE_TOP) }
            else if (y > thresholdY)  { onThresholdReached(SWIPE_BOTTOM) }
            // else setPosition({ x: 0, y: 0, rotation: 0 })
            else setPosition({ })
         }
      })
   })
   
   onUnmounted(() => { 
      unsetInteractElement()
   })

   const transformString = computed(() => {
      const { x, y, rotation } = interactPosition.value
      return `translate3D(${x}px, ${y}px, 0) rotate(${rotation}deg)`
   })

   const transitionString = computed(() => {
      return !isDragging.value && props.transition
   })

   const onThresholdReached = (interaction) => {
      const { outOfSightXOffset, outOfSightYOffset, maxRotation } = props
      unsetInteractElement()
      if (interaction == SWIPE_RIGHT) {
         setPosition({ x: outOfSightXOffset })
         // setPosition({ x: outOfSightXOffset, rotation: maxRotation })
         // emit(SWIPE_RIGHT)
      }
      else if (interaction == SWIPE_LEFT) {
         setPosition({x: -outOfSightXOffset })
         // setPosition({x: -outOfSightXOffset, rotation: -maxRotation })
         // emit(SWIPE_LEFT);
      }
      // else if (interaction == SWIPE_TOP) {
      //    setPosition({ y: -outOfSightYOffset })
      //    emit(SWIPE_TOP)
      // }
      // else if (interaction == SWIPE_BOTTOM) {
      //    setPosition({ y: outOfSightYOffset })
      //    emit(SWIPE_BOTTOM)
      // }
      emit(SWIPE_ANY, interaction, props.item.name)
   }
  
   const setPosition = (position) => {
      const { x=0, y=0, rotation=0 } = position
      interactPosition.value = { x, y, rotation }
   }

   const unsetInteractElement = () => {
      console.log("unsetInteractElement")

      // console.log("isSet", interact(interactElement.value).isSet())

      // interact(interactElement.value).unset()
   }
</script>

<style>
</style>
