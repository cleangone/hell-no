<template>
   <v-card :style="cardStyle">
      <v-card-title>
         <v-row no-gutters class="flex-nowrap" style="white-space:nowrap">
            <v-col cols="5" class="flex-grow-0 flex-shrink-0 nav-left font-weight-medium">
               {{ currItem?.name }}
            </v-col>
            <v-col class="d-flex flex-grow-1 flex-shrink-0 justify-center">
               <IconButton v-if="multipleItems" icon="mdi-chevron-left" @click="prev()" size="med"/>
               <span v-if="isFullscreen" class="mx-4 text-blue">{{ currItem?.name }}</span>
               <IconButton v-if="multipleItems" icon="mdi-chevron-right" @click="next()" size="med"/>
            </v-col>
            <v-col cols="5" class="flex-grow-0 flex-shrink-0 nav-right" >
               <IconButton icon="mdi-arrow-expand" @click="fullscreenToggle"/>
               <IconButton icon="mdi-close" @click="$emit(Emit.DONE)"/>
            </v-col>
         </v-row>
      </v-card-title>
      
      <!-- non-fullscreen image -->
      <v-img v-if="!isFullscreen && currItem" :src="currItem.primaryImage.url" :aspect-ratio="aspectRatio" @click="$emit(Emit.DONE)" class="mx-3"/>


      <!-- <div ref="fullscreenEle"> -->
         <!-- <div class="card"

            :style="'background-image: url(' +backgroundImage.url+ ');}'"  > -->
         <!-- <v-img :src="backgroundImage.url"
    cover
    min-height="100vh"
    class="dimmed-background d-flex align-start justify-center"
   
  > -->
         <!-- <img v-if="backgroundImage" :src="backgroundImage.url" :style="backgroundStyle"/> -->
         <!-- <div class="content"> -->
            <!-- <div style="clear:both"></div> -->
            <!-- <div v-if="isFullscreen" class="text-center">
                
               <ReuseTemplate/>
            </div>
            <v-img v-if="isFullscreen && currItem" :src="currItem.primaryImage.url" 
               height="98vh" contain :aspect-ratio="aspectRatio" @click="$emit(Emit.DONE)"/> -->
        

      <div ref="fullscreenEle">
         <div v-if="isFullscreen" class="text-center">
            <IconButton v-if="multipleItems" icon="mdi-chevron-left" @click="prev()" size="med" class="color-full"/>
            <span v-if="isFullscreen" class="mx-4 color-full">{{ currItem?.name }}</span>
            <IconButton v-if="multipleItems" icon="mdi-chevron-right" @click="next()" size="med" class="color-full"/>
         </div>
         <v-img v-if="isFullscreen && currItem" :src="currItem.primaryImage.url" :aspect-ratio="aspectRatio" @click="$emit(Emit.DONE)"/>
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
   const items = ref([])
   const itemIndex = ref(0)
   const fullscreenEle = ref(null)
   const { isFullscreen, toggle: fullscreenToggle } = useFullscreen(fullscreenEle)  

   onMounted(() => { 
      items.value = itemMgr.ungroupAndExtractItems(props.items)
      if (props.item) { itemIndex.value = getItemIndex() }
      if (props.fullscreen) { fullscreenToggle() }
   })

   const cardStyle = computed(() => "width:" + (windowWidth.value - 100) + "px; height:" + (windowHeight.value - 20) + "px")

   const multipleItems = computed(() => items.value.length > 0)
   const currItem = computed(() => {
      const item = items.value.length ? items.value[itemIndex.value] : null      
      if (item) { viewMgr.addHit(item.linkId ? item.linkId : item.id) }
      return item
   })
   const aspectRatio = computed(() => currItem.value ? itemMgr.itemAspectRatio(currItem.value) : 1)
 

//  const backgroundStyle = computed(() => "opacity: .10;") // make this configurable?
   
   // const backgroundStyle = computed(() => {
   //    const style = props.backgroundImage ? "{ backgroundImage:url('" + props.backgroundImage.url + "'); }" : ""
   //    // const style = props.backgroundImage ? "{ backgroundImage:url(" + props.backgroundImage.url + "); opacity: .05; }" : ""
   //    console.log("style", style)
   //    return style
   // })

   const getItemIndex = () => { 
      for (var i=0; i<items.value.length; i++) { 
         const item = items.value[i]
         const itemId = item.linkId ? item.linkId : item.id
         if (props.item.id == itemId) { return i } // will catch first child of a groupItem
      }
      return 0
   }

   const prev = () => { itemIndex.value = itemIndex.value ? itemIndex.value -1 : items.value.length - 1 }
   const next = () => { itemIndex.value = itemIndex.value == items.value.length - 1 ? 0 : itemIndex.value + 1 }

   // dialog listeners added last and executed last - stopImmediatePropagation and return false doesn't stop previous listeners 
   onKeyStroke('ArrowLeft',  (e) => { prev() })
   onKeyStroke('ArrowRight', (e) => { next() })
   onKeyStroke('ArrowUp',    (e) => { emit(Emit.DONE) })
</script>

<style>

.color-full {
   background-color: black !important; 
   color: var(--c-link-light)  !important;
}
.card {
  /* Set a background color with the desired transparency layer */
  background-color: rgb(255 255 255 / 50%); 
  /* background-image: url('your-image.jpg'); */
  
  /* Blend the image into the color layer */
  background-blend-mode: lighten; /* Or 'multiply', 'darken' depending on your color */
  background-size: cover;
}


/* 
.dimmed-background  {
  opacity: 0.1;
} */

.fullscreen-bg {
  /* Prevent the image from repeating */
  background-repeat: no-repeat;
  
  /* Scale the image to cover the entire viewport */
  background-size: cover;
  
  /* Center the image within the viewport */
  background-position: center center;
  
  /* Fix the background so it doesn't move when scrolling */
  background-attachment: fixed;
  
  /* Set fallback or surrounding color */
  background-color: black; 
  
  /* Force it to take up the full screen height */
  height: 100vh;
  width: 100vw;
}
</style>
