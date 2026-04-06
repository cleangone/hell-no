<template>
   <v-card :style="cardStyle">
      <v-card-title>
         <v-row no-gutters class="flex-nowrap" style="white-space:nowrap">
            <v-col cols="5" class="flex-grow-0 flex-shrink-0 nav-left font-weight-medium">
               {{ props.item.name }}
            </v-col>
            <v-col class="d-flex flex-grow-1 flex-shrink-0 justify-center">
               <IconButton v-if="multipleImages" icon="mdi-chevron-left"  @click="prev()" size="med" />
               <IconButton v-if="multipleImages" icon="mdi-chevron-right" @click="next()" size="med"/>
            </v-col>
            <v-col cols="5" class="flex-grow-0 flex-shrink-0 nav-right" >
               <IconButton icon="mdi-arrow-expand" @click="fullscreenToggle"/>
               <IconButton icon="mdi-close" @click="$emit(Emit.DONE)"/>
            </v-col>
         </v-row>
      </v-card-title>
      
      <v-img :src="imageToShow.url" contain ref="fullscreenEle" @click="$emit(Emit.DONE)" class="mx-3"/>
   </v-card>
</template>

<script setup>
   import { computed, onMounted, ref } from 'vue'
   import { onKeyStroke, useFullscreen, useWindowSize } from '@vueuse/core'
   import IconButton from '@/components/util/IconButton.vue'
   import { Emit, ImageType } from '@/utils/constants'
   
   const props = defineProps({ initialImage: Object, item: Object })
   const emit = defineEmits([Emit.DONE])

   const { width: windowWidth } = useWindowSize()
   const imageToShow = ref({})
   const navImages   = ref([])
   
   const fullscreenEle = ref(null)
   const { toggle: fullscreenToggle } = useFullscreen(fullscreenEle)  

   onMounted(async() => {
      imageToShow.value = props.initialImage ? props.initialImage : props.item.primaryImage
      
      navImages.value = [ props.item.primaryImage ]
      if (props.item.otherImages) {
         for (const image of props.item.otherImages) {
            if (image.imageType != ImageType.GALLERY) { navImages.value.push(image) }
         }
      }
   })

   const cardStyle = computed(() => "min-width:" + (windowWidth.value - 100) + "px")
   const multipleImages = computed(() => navImages.value.length > 1)
   
   const prev = () => { 
      let prevIndex = -1
      for (let i=0; i<navImages.value.length; i++) {
         if (navImages.value[i].id == imageToShow.value.id) {
            prevIndex = i == 0 ? navImages.value.length - 1 : i - 1
         }
      }
      if (prevIndex != -1) { imageToShow.value = navImages.value[prevIndex] }
   }

   const next = () => { 
      let nextIndex = -1
      for (let i=0; i<navImages.value.length; i++) {
         if (navImages.value[i].id == imageToShow.value.id) {
            nextIndex = i == navImages.value.length - 1 ? 0 : i + 1
         }
      }
      if (nextIndex != -1) { imageToShow.value = navImages.value[nextIndex] }
   }

   // stopPropagation not working
   onKeyStroke('ArrowLeft', (e) => {
      // console.log("ShowItemImages.ArrowLeft")
      prev()
      e.preventDefault()
      e.stopPropagation()
      return false
   })
   onKeyStroke('ArrowRight', (e) => {
      // console.log("ShowItemImages.ArrowRight")
      next()
      e.preventDefault()  
      e.stopPropagation()
      return false
   })
   onKeyStroke('ArrowUp', (e) => { emit(Emit.DONE) })
</script>

<style>
</style>
