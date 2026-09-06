<template>
   <v-card :style="cardStyle">
      <v-card-title>
         <v-row no-gutters class="flex-nowrap" style="white-space:nowrap">
            <v-col cols="5" class="flex-grow-0 flex-shrink-0 nav-left font-weight-medium">
               {{ currItem?.name }}
            </v-col>
            <v-col class="d-flex flex-grow-1 flex-shrink-0 justify-center">
               <IconButton v-if="multipleItems" icon="mdi-chevron-left" @click="prev()" size="med" class="admin-link"/>
               <span v-if="isFullscreen" class="mx-4 text-blue">{{ currItem?.name }}</span>
               <IconButton v-if="multipleItems" icon="mdi-chevron-right" @click="next()" size="med" class="admin-link"/>
            </v-col>
            <v-col cols="5" class="flex-grow-0 flex-shrink-0 nav-right" >
               <IconButton icon="mdi-arrow-expand" @click="fullscreenToggle" class="admin-link"/>
               <IconButton icon="mdi-close" @click="$emit(Emit.DONE)" class="admin-link"/>
            </v-col>
         </v-row>
      </v-card-title>
      
      <div ref="fullscreenEle">
         <!-- fullscreen with background image -->
         <div v-if="isFullscreen" class="fullscreen-container">
            <img v-if="backgroundImage" :src="backgroundImage.url" class="fullscreen-dimmed"/>
            <div class="fullscreen-content">
               <div v-if="multipleItems" class="text-center fullscreen-text">
                  <IconButton icon="mdi-chevron-left" @click="prev()" size="med"/>
                  <span class="mx-4">{{ currItem?.name }}</span>
                  <IconButton v-if="isPlaying" icon="mdi-pause" @click="pause()"/>
                  <IconButton v-else icon="mdi-play" @click="play()"/>
                  <IconButton icon="mdi-chevron-right" @click="next()" size="med"/>
               </div>
               <div v-else class="text-center mx-4">{{ currItem?.name }}</div>
               <v-container fluid class="pa-0 ma-0 fullscreen-slider">  
                  <div class="slider-wrapper" :class="transition">
                     <transition name="slide">
                        <!-- div for smooth slide transition -->
                        <div :key="currItem.id" :style="{ backgroundImage: `url(${currItem.primaryImage.url})` }" 
                           class="fullscreen-image-slide"></div>
                        <!-- <v-img :src="currItem.primaryImage.url" :key="currItem.id" class="fullscreen-image"/> -->
                     </transition>
                  </div>
               </v-container>
            </div>
         </div>
         <v-img v-else-if="currItem" :src="currItem.primaryImage.url" :aspect-ratio="aspectRatio" @click="$emit(Emit.DONE)" class="mx-3"/>
      </div>
   </v-card>
</template>

<script setup>
   import { computed, onMounted, ref } from 'vue'
   import { onKeyStroke, useFullscreen, useWindowSize } from '@vueuse/core'
   import { useItemMgr } from '@/stores/itemMgr'
   import { useViewMgr } from '@/stores/viewMgr'  
   import IconButton from '@/components/util/IconButton.vue'
   import { Emit } from '@/utils/constants'
   
   const props = defineProps({ items: Object, item: Object, fullscreen: Boolean, backgroundImage: Object })
   const emit = defineEmits([Emit.DONE])

   const { width: windowWidth, height: windowHeight } = useWindowSize()
   const itemMgr = useItemMgr()
   const viewMgr = useViewMgr()
   const fullscreenEle = ref(null)
   const items      = ref([])
   const itemIndex  = ref(0)
   const isPlaying  = ref(false)
   const transition = ref('slide-left')

   const { isFullscreen, toggle: fullscreenToggle } = useFullscreen(fullscreenEle)  

   onMounted(() => { 
      items.value = itemMgr.ungroupAndExtractItems(props.items)
      if (props.item) { itemIndex.value = getItemIndex() }
      if (props.fullscreen) { fullscreenToggle() }
   })

   const cardStyle = computed(() => "width:" + (windowWidth.value - 100) + "px; height:" + (windowHeight.value - 20) + "px")

   const multipleItems = computed(() => items.value.length > 1)
   const currItem = computed(() => {
      const item = items.value.length ? items.value[itemIndex.value] : null      
      if (item) { viewMgr.addHit(item.linkId ? item.linkId : item.id) }
      return item
   })
   const aspectRatio = computed(() => currItem.value ? itemMgr.itemAspectRatio(currItem.value) : 1)

   const getItemIndex = () => { 
      for (var i=0; i<items.value.length; i++) { 
         const item = items.value[i]
         const itemId = item.linkId ? item.linkId : item.id
         if (props.item.id == itemId) { return i } // will catch first child of a groupItem
      }
      return 0
   }

   const prev = () => { 
      transition.value = 'slide-right'
      itemIndex.value = itemIndex.value ? itemIndex.value -1 : items.value.length - 1 
   }
   const next = () => { 
      transition.value = 'slide-left' 
      itemIndex.value = itemIndex.value == items.value.length - 1 ? 0 : itemIndex.value + 1 
   }

   const continuePlay = () => { 
      setTimeout(() => { 
         if (isPlaying.value) { 
            next()
            continuePlay()
         }
      }, 5000)  
   }

   const play = () => { 
      isPlaying.value = true 
      continuePlay()
   }
   const pause = () => { isPlaying.value = false }

   // dialog listeners added last and executed last - stopImmediatePropagation and return false doesn't stop previous listeners 
   onKeyStroke('ArrowLeft',  (e) => { prev() })
   onKeyStroke('ArrowRight', (e) => { next() })
   onKeyStroke('ArrowUp',    (e) => { emit(Emit.DONE) })
</script>

<style>
.fullscreen-container {
   position: relative;
   min-height: 100vh;
   overflow: hidden;
}
.fullscreen-dimmed {
   position: absolute;
   top: 0;
   left: 0;
   width: 100%;
   height: 100%;
   object-fit: cover;
   object-position: top; 
   filter: brightness(0.10); 
   z-index: -1;
}
.fullscreen-content {
   position: relative;
   z-index: 1;
   padding: 2rem;
}
.fullscreen-text {
   color: var(--c-link-light)  !important;
}
.fullscreen-text .v-btn {
   color: inherit;
}

.fullscreen-image {
   height: 95vh;
   width: auto;
}

.fullscreen-slider {
  height: 95vh;
  width: 100%;
  overflow: hidden;
}

.slider-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
}

/* sliding replacement for v-img */
.fullscreen-image-slide {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-size: contain;      /* Keeps the aspect ratio accurate like your old code */
  background-position: center;   /* Centers the desktop asset */
  background-repeat: no-repeat;
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.6s cubic-bezier(0.25, 0.8, 0.5, 1), opacity 0.6s ease;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
}

.slide-left .slide-enter-from {
  transform: translateX(100%);
  opacity: 0;
}
.slide-left .slide-leave-to {
  transform: translateX(-100%);
  opacity: 0;
}

.slide-right .slide-enter-from {
  transform: translateX(-100%);
  opacity: 0;
}
.slide-right .slide-leave-to {
  transform: translateX(100%);
  opacity: 0;
}
</style>
